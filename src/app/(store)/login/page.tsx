import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LayoutDashboard, UserRound } from "lucide-react";
import { auth } from "@/auth";
import { LoginForm } from "@/components/forms/login-form";
import { signInDemo, signInWithGoogle } from "@/server/actions/auth";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const errors: Record<string, string> = {
  Verification: "That sign-in link has expired or was already used. Request a new one below.",
  OAuthAccountNotLinked: "That email is already linked to another sign-in method.",
  AccessDenied: "Access denied.",
  Configuration: "Sign-in isn't fully configured yet. Check the server logs.",
  CredentialsSignin: "Demo sign-in failed. Did you run the seed script?",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/account";
  const session = await auth();
  if (session?.user) redirect(callbackUrl.startsWith("/") ? callbackUrl : "/account");
  const error = typeof params.error === "string" ? (errors[params.error] ?? "Something went wrong signing you in. Please try again.") : null;
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Sign in to see your orders, re-download your programs and check out faster.</p>

        {error && (
          <p role="alert" className="mt-6 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-8 space-y-4">
          {googleEnabled && (
            <>
              <form action={signInWithGoogle}>
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <button type="submit" className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-input bg-white font-semibold transition hover:border-ink">
                  <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
                  </svg>
                  Continue with Google
                </button>
              </form>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}
          <LoginForm callbackUrl={callbackUrl} />
        </div>

        {demo && (
          <div className="mt-10 rounded-3xl bg-ember-soft p-5">
            <p className="font-semibold">Exploring the demo?</p>
            <p className="mt-1 text-sm text-muted-foreground">Jump straight in without an inbox. The demo admin is read-only.</p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <form action={signInDemo}>
                <input type="hidden" name="persona" value="customer" />
                <input type="hidden" name="callbackUrl" value={callbackUrl} />
                <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold shadow-sm transition hover:shadow">
                  <UserRound className="size-4" aria-hidden /> Demo customer
                </button>
              </form>
              <form action={signInDemo}>
                <input type="hidden" name="persona" value="admin" />
                <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-sm font-semibold text-white transition hover:bg-ink/85">
                  <LayoutDashboard className="size-4" aria-hidden /> Demo admin
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
