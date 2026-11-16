import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

/** For pages: redirects to login when signed out. */
export async function requireUser(callbackUrl = "/account") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

export class AuthError extends Error {}

/**
 * Verifies the admin role against the database (not just the JWT).
 * - read: ADMIN and DEMO_ADMIN (read-only portfolio viewer)
 * - write: ADMIN only
 */
export async function requireAdmin(mode: "read" | "write" = "read") {
  const session = await auth();
  if (!session?.user) throw new AuthError("Please sign in.");
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true, email: true, name: true } });
  if (!user) throw new AuthError("Please sign in.");
  if (user.role === "ADMIN") return user;
  if (user.role === "DEMO_ADMIN" && mode === "read") return user;
  if (user.role === "DEMO_ADMIN") throw new AuthError("The demo admin is read-only. Changes are disabled in the public demo.");
  throw new AuthError("You don't have access to the admin dashboard.");
}

/** For admin pages: redirects instead of throwing. */
export async function requireAdminPage() {
  try {
    return await requireAdmin("read");
  } catch {
    const session = await auth();
    redirect(session?.user ? "/account?denied=admin" : "/login?callbackUrl=/admin");
  }
}
