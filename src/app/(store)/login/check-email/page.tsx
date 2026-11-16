import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = { title: "Check your email", robots: { index: false } };

export default function CheckEmailPage() {
  const devNoEmail = !process.env.RESEND_API_KEY && process.env.NODE_ENV !== "production";
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-12 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-ember-soft">
          <MailCheck className="size-7 text-ember-strong" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight">Check your inbox</h1>
        <p className="mt-3 text-muted-foreground">We sent you a sign-in link. It works once and expires in 24 hours. Don&apos;t forget to peek in your spam folder.</p>
        {devNoEmail && (
          <p className="mt-6 rounded-2xl bg-muted p-4 text-left text-sm">
            <strong>Local dev:</strong> RESEND_API_KEY isn&apos;t set, so the magic link was printed in your terminal instead of emailed.
          </p>
        )}
        <Link href="/login" className="mt-8 inline-block text-sm font-semibold underline underline-offset-4">
          Use a different email
        </Link>
      </div>
    </div>
  );
}
