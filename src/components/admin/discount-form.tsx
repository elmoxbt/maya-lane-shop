"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { discountFormSchema, type DiscountFormValues } from "@/lib/validations-admin";
import { createDiscount } from "@/server/actions/admin/marketing";

export function DiscountForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const form = useForm<DiscountFormValues>({ resolver: zodResolver(discountFormSchema), defaultValues: { code: "", description: "", type: "PERCENTAGE", value: 10, expiresAt: "" } });
  const { errors } = form.formState;
  const type = useWatch({ control: form.control, name: "type" });

  const onSubmit = form.handleSubmit((values) =>
    start(async () => {
      const res = await createDiscount(values);
      if (res.ok) {
        toast.success(res.message);
        form.reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
        for (const [k, m] of Object.entries(res.fieldErrors ?? {})) if (m?.[0]) form.setError(k as keyof DiscountFormValues, { message: m[0] });
      }
    }),
  );

  const err = (k: keyof DiscountFormValues) =>
    errors[k]?.message ? (
      <p role="alert" className="text-sm text-destructive">
        {String(errors[k]?.message)}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-10 rounded-full px-4">
          <Plus aria-hidden /> New code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New discount code</DialogTitle>
          <DialogDescription>Customers enter this in the cart before checkout.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4" id="discount-form">
          <div className="space-y-1.5">
            <Label htmlFor="dc-code">Code</Label>
            <Input id="dc-code" className="h-10 font-mono uppercase" placeholder="CYBER25" aria-invalid={Boolean(errors.code)} {...form.register("code")} />
            {err("code")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dc-desc">Internal note (optional)</Label>
            <Input id="dc-desc" className="h-10" placeholder="Cyber Monday TikTok live" {...form.register("description")} />
          </div>
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-2 gap-2" aria-label="Discount type">
                {[
                  ["PERCENTAGE", "Percentage"],
                  ["FIXED", "Fixed amount"],
                ].map(([v, l]) => (
                  <Label key={v} htmlFor={`dc-${v}`} className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 has-data-[state=checked]:border-ink">
                    <RadioGroupItem id={`dc-${v}`} value={v} /> {l}
                  </Label>
                ))}
              </RadioGroup>
            )}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dc-value">{type === "PERCENTAGE" ? "Percent off" : "Amount off ($)"}</Label>
              <Input id="dc-value" type="number" step={type === "PERCENTAGE" ? 1 : 0.01} min="0" className="h-10" aria-invalid={Boolean(errors.value)} {...form.register("value")} />
              {err("value")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-min">Min. subtotal ($)</Label>
              <Input id="dc-min" type="number" step="0.01" min="0" className="h-10" placeholder="None" {...form.register("minSubtotal")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-max">Usage limit</Label>
              <Input id="dc-max" type="number" min="1" className="h-10" placeholder="Unlimited" aria-invalid={Boolean(errors.maxUses)} {...form.register("maxUses")} />
              {err("maxUses")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dc-exp">Expires</Label>
              <Input id="dc-exp" type="date" className="h-10" aria-invalid={Boolean(errors.expiresAt)} {...form.register("expiresAt")} />
              {err("expiresAt")}
            </div>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="discount-form" disabled={pending} className="h-10 rounded-full px-5">
            {pending && <Loader2 className="animate-spin" aria-hidden />} Create code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
