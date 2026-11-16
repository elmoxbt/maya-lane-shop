"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { requestMagicLink } from "@/server/actions/auth";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address") });

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [pending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } });
  const error = form.formState.errors.email?.message;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const res = await requestMagicLink({ ...values, callbackUrl });
      if (res && !res.ok) toast.error(res.error);
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <label htmlFor="login-email" className="text-sm font-semibold">
        Email address
      </label>
      <input
        id="login-email"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="you@email.com"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "login-email-error" : undefined}
        className="mt-1.5 h-12 w-full rounded-full border border-input bg-white px-5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ember aria-invalid:border-destructive"
        {...form.register("email")}
      />
      {error && (
        <p id="login-email-error" role="alert" className="px-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-semibold text-white transition hover:bg-ink/85 disabled:opacity-70">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Mail className="size-4" aria-hidden />}
        Email me a sign-in link
      </button>
      <p className="text-center text-xs text-muted-foreground">No password needed. New here? This creates your account.</p>
    </form>
  );
}
