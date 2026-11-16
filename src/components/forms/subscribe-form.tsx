"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import { subscribe } from "@/server/actions/marketing";
import { cn } from "@/lib/utils";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address"), company: z.string().optional() });
type Values = z.infer<typeof schema>;

export function SubscribeForm({
  source,
  cta = "Send me the plan",
  tone = "light",
  className,
}: {
  source: "lead-magnet" | "footer" | "gift-guide";
  cta?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "", company: "" } });
  const error = form.formState.errors.email?.message;
  const id = `subscribe-${source}`;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const res = await subscribe({ ...values, source });
      if (res.ok) {
        toast.success(res.message ?? "You're in!");
        form.reset();
      } else {
        toast.error(res.error);
        if (res.fieldErrors?.email) form.setError("email", { message: res.fieldErrors.email[0] });
      }
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className={cn("w-full", className)}>
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full border p-1.5 transition focus-within:ring-2 focus-within:ring-ember",
          tone === "dark" ? "border-white/20 bg-white/5" : "border-input bg-white",
          error && "border-destructive",
        )}
      >
        <label htmlFor={id} className="sr-only">
          Email address
        </label>
        <input
          id={id}
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-11 min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-muted-foreground",
            tone === "dark" && "text-white placeholder:text-white/50",
          )}
          {...form.register("email")}
        />
        {/* Honeypot */}
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...form.register("company")} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-ember px-5 text-sm font-bold text-ink transition hover:brightness-95 disabled:opacity-70"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          <span className="hidden sm:inline">{cta}</span>
          <span className="sm:hidden">{pending ? "Sending" : "Join"}</span>
          {!pending && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className={cn("mt-2 px-4 text-sm", tone === "dark" ? "text-ember" : "text-destructive")}>
          {error}
        </p>
      )}
    </form>
  );
}
