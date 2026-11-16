"use client";

import { useState, useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { budgetOptions, inquirySchema } from "@/lib/validations";
import { submitBrandInquiry } from "@/server/actions/marketing";

type Values = z.input<typeof inquirySchema>;

function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function InquiryForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", email: "", company: "", website: "", message: "", hp: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const res = await submitBrandInquiry(values);
      if (res.ok) {
        setSent(true);
        toast.success(res.message ?? "Inquiry sent!");
        form.reset();
      } else {
        toast.error(res.error);
        for (const [key, msgs] of Object.entries(res.fieldErrors ?? {})) {
          if (msgs?.[0]) form.setError(key as keyof Values, { message: msgs[0] });
        }
      }
    }),
  );

  if (sent) {
    return (
      <div className="flex flex-col items-start rounded-3xl bg-ember-soft p-8" role="status">
        <CheckCircle2 className="size-10 text-success" aria-hidden />
        <h3 className="mt-4 font-display text-2xl font-bold">Thanks, we&apos;ve got it!</h3>
        <p className="mt-2 text-muted-foreground">A confirmation is on its way to your inbox. Expect a reply within three business days.</p>
        <button type="button" onClick={() => setSent(false)} className="mt-6 text-sm font-semibold underline underline-offset-4">
          Send another inquiry
        </button>
      </div>
    );
  }

  const aria = (name: keyof Values) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `inq-${name}-error` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-5 rounded-3xl border bg-white p-6 sm:grid-cols-2 sm:p-8">
      <Field id="inq-name" label="Your name" error={errors.name?.message}>
        <Input id="inq-name" autoComplete="name" className="h-11" {...aria("name")} {...form.register("name")} />
      </Field>
      <Field id="inq-email" label="Work email" error={errors.email?.message}>
        <Input id="inq-email" type="email" autoComplete="email" className="h-11" {...aria("email")} {...form.register("email")} />
      </Field>
      <Field id="inq-company" label="Brand / company" error={errors.company?.message}>
        <Input id="inq-company" autoComplete="organization" className="h-11" {...aria("company")} {...form.register("company")} />
      </Field>
      <Field id="inq-website" label="Website (optional)" error={errors.website?.message}>
        <Input id="inq-website" type="url" placeholder="https://" className="h-11" {...aria("website")} {...form.register("website")} />
      </Field>
      <div className="sm:col-span-2">
        <Field id="inq-budget" label="Budget" error={errors.budget?.message}>
          <Controller
            control={form.control}
            name="budget"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="inq-budget" className="h-11! w-full" {...aria("budget")}>
                  <SelectValue placeholder="Choose a range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetOptions.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field id="inq-message" label="Tell us about the campaign" error={errors.message?.message} hint="Timeline, deliverables, product and goals.">
          <Textarea id="inq-message" rows={5} {...aria("message")} {...form.register("message")} />
        </Field>
      </div>
      <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...form.register("hp")} />
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-7 font-semibold text-white transition hover:bg-ink/85 disabled:opacity-70 sm:w-auto">
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden />} Send inquiry
        </button>
      </div>
    </form>
  );
}
