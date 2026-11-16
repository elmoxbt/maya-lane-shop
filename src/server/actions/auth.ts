"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { fail, fromZod, type ActionResult } from "@/lib/action-result";
import { magicLinkSchema } from "@/lib/validations";
import { limits, rateLimit } from "@/server/rate-limit";

/** Only allow same-site relative redirects. */
function safeCallback(url?: string) {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return "/account";
  return url;
}

export async function requestMagicLink(input: unknown): Promise<ActionResult> {
  const parsed = magicLinkSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);
  const rl = await rateLimit("magic-link", limits.magicLink);
  if (!rl.ok) return fail("Too many sign-in attempts. Please wait a few minutes and try again.");
  try {
    await signIn("resend", { email: parsed.data.email, redirectTo: safeCallback(parsed.data.callbackUrl), redirect: false });
  } catch (err) {
    if (err instanceof AuthError) return fail("We couldn't send your sign-in link. Please try again.");
    throw err;
  }
  redirect("/login/check-email");
}

export async function signInWithGoogle(formData: FormData) {
  const rl = await rateLimit("oauth", limits.magicLink);
  if (!rl.ok) throw new Error("Too many attempts");
  await signIn("google", { redirectTo: safeCallback(formData.get("callbackUrl")?.toString()) });
}

export async function signInDemo(formData: FormData) {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") throw new Error("Demo sign-in is disabled");
  const persona = formData.get("persona") === "admin" ? "admin" : "customer";
  const rl = await rateLimit("demo-login", { limit: 20, windowSeconds: 600 });
  if (!rl.ok) throw new Error("Too many attempts");
  await signIn("demo", { persona, redirectTo: persona === "admin" ? "/admin" : safeCallback(formData.get("callbackUrl")?.toString()) });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
