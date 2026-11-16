import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Coarse gate for /admin and /account. Every page and server action re-checks the role
 * against the database (see src/server/auth-guards.ts).
 *
 * This deliberately only READS the session token. Auth.js's `auth()` proxy wrapper re-issues
 * the session cookie on every request it sees, so a page prefetch that was already in flight
 * when the user clicked "Sign out" could write the session straight back. Reading is enough here.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: req.nextUrl.protocol === "https:",
  });

  if (!token) {
    const login = new URL("/login", req.nextUrl);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (pathname.startsWith("/admin") && token.role !== "ADMIN" && token.role !== "DEMO_ADMIN") {
    return NextResponse.redirect(new URL("/account?denied=admin", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
