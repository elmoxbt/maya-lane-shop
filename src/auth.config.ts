import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no database, no Node-only imports).
 * Used by proxy.ts to read the JWT session cheaply. The full config lives in auth.ts.
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
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role;
      if (pathname.startsWith("/admin")) return role === "ADMIN" || role === "DEMO_ADMIN" ? true : Response.redirect(new URL(auth ? "/account?denied=admin" : `/login?callbackUrl=${encodeURIComponent(pathname)}`, request.nextUrl));
      if (pathname.startsWith("/account")) return Boolean(auth?.user);
      return true;
    },
  },
} satisfies NextAuthConfig;
