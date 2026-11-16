import type { NextAuthConfig } from "next-auth";

/**
 * Shared Auth.js config (no database imports): pages, JWT session strategy and session shape.
 * The full config (adapter, providers, role refresh) lives in auth.ts.
 */
export const authConfig = {
  pages: { signIn: "/login", verifyRequest: "/login/check-email", error: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role ?? "CUSTOMER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
