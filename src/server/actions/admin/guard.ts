import "server-only";
import { AuthError, requireAdmin } from "@/server/auth-guards";
import { fail, type ActionResult } from "@/lib/action-result";

/** Runs a mutation only for real admins; the read-only demo admin gets a friendly error. */
export async function withAdmin<T>(fn: (admin: Awaited<ReturnType<typeof requireAdmin>>) => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    const admin = await requireAdmin("write");
    return await fn(admin);
  } catch (err) {
    if (err instanceof AuthError) return fail(err.message);
    console.error("[admin action]", err);
    return fail("Something went wrong. Please try again.");
  }
}
