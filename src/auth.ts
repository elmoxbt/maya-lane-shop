import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { MagicLinkEmail } from "@/emails/templates";

const ROLE_REFRESH_MS = 5 * 60 * 1000;

const providers: Provider[] = [
  Resend({
    apiKey: process.env.RESEND_API_KEY ?? "dev-no-key",
    from: process.env.EMAIL_FROM ?? "Maya Lane Shop <onboarding@resend.dev>",
    async sendVerificationRequest({ identifier, url }) {
      if (!process.env.RESEND_API_KEY) console.info(`\n🔑 [auth:dev] Magic link for ${identifier}:\n   ${url}\n`);
      await sendEmail({ to: identifier, subject: "Your Maya Lane sign-in link", react: MagicLinkEmail({ url }) });
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({ allowDangerousEmailAccountLinking: true }));
}

/**
 * Demo personas, enabled only when NEXT_PUBLIC_DEMO_MODE=true, so portfolio visitors can explore
 * the customer account and a READ-ONLY admin dashboard without an inbox. Disable in production.
 */
const demoPersonas = { customer: "demo@mayalane.shop", admin: "demo-admin@mayalane.shop" } as const;
if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
  providers.push(
    Credentials({
      id: "demo",
      name: "Demo",
      credentials: { persona: { type: "text" } },
      async authorize(credentials) {
        const persona = credentials?.persona as keyof typeof demoPersonas | undefined;
        const email = persona ? demoPersonas[persona] : undefined;
        if (!email) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || user.role === "ADMIN") return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // The generated Prisma 7 client is structurally compatible with the adapter's expected client.
  adapter: PrismaAdapter(db as unknown as Parameters<typeof PrismaAdapter>[0]),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role ?? "CUSTOMER";
        token.roleCheckedAt = Date.now();
        return token;
      }
      // Re-read the role periodically so promotions/demotions take effect without re-login.
      if (token.sub && (trigger === "update" || !token.roleCheckedAt || Date.now() - token.roleCheckedAt > ROLE_REFRESH_MS)) {
        const dbUser = await db.user.findUnique({ where: { id: token.sub }, select: { role: true } });
        if (!dbUser) return null;
        token.role = dbUser.role;
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
  },
  events: {
    async createUser({ user }) {
      // The configured ADMIN_EMAIL becomes an admin on first sign-in.
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
      if (adminEmail && user.email?.toLowerCase() === adminEmail && user.id) {
        await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
      }
    },
  },
});
