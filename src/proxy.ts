import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Coarse, JWT-only gate for /admin and /account. Every page and server action
// re-checks the role against the database (see src/server/auth-guards.ts).
const { auth } = NextAuth(authConfig);

export const proxy = auth;

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
