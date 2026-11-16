"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowRight, Download, Loader2, Lock, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "./quantity-stepper";
import { cartCount, cartSubtotal, useCart } from "@/stores/cart-store";
import { formatPriceExact, formatPrice } from "@/lib/format";
import { siteConfig } from "@/config/site";
import { computeDiscount, type DiscountRule } from "@/lib/discounts";
import { checkDiscountCode, createCheckoutSession } from "@/server/actions/checkout";

type AppliedCode = DiscountRule & { label: string };

export function CartDrawer() {
  const { lines, isOpen, setOpen, setQuantity, remove, close } = useCart();
  const hydrated = useCart((s) => s.hydrated);
  const [pending, startTransition] = useTransition();
  const [codePending, startCodeTransition] = useTransition();
  const [codeInput, setCodeInput] = useState("");
  const [applied, setApplied] = useState<AppliedCode | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  const suggestedCode = useCart((s) => s.suggestedCode);
  const suggestCode = useCart((s) => s.suggestCode);
  const subtotal = cartSubtotal(lines);

  // Auto-apply a suggested code (e.g. GIFTKIT15 after adding a gift bundle)
  useEffect(() => {
    if (!suggestedCode || !isOpen || applied) return;
    suggestCode(null);
    startCodeTransition(async () => {
      const res = await checkDiscountCode({ code: suggestedCode, subtotalCents: cartSubtotal(useCart.getState().lines) });
      if (res.ok) {
        setApplied(res.data);
        toast.success(`${res.data.code} applied: ${res.data.label}`);
      }
    });
  }, [suggestedCode, isOpen, applied, suggestCode]);
  const count = cartCount(lines);
  const hasPhysical = lines.some((l) => l.type === "PHYSICAL");
  const remainingForFree = Math.max(0, siteConfig.shipping.freeThresholdCents - subtotal);
  const progress = Math.min(100, (subtotal / siteConfig.shipping.freeThresholdCents) * 100);
  // Recomputed live so the discount stays right as quantities change
  const discount = applied ? computeDiscount(applied, subtotal) : 0;
  const belowMinimum = Boolean(applied?.minSubtotalCents && subtotal < applied.minSubtotalCents);

  function applyCode(e: React.FormEvent) {
    e.preventDefault();
    setCodeError(null);
    startCodeTransition(async () => {
      const res = await checkDiscountCode({ code: codeInput, subtotalCents: subtotal });
      if (res.ok) {
        setApplied(res.data);
        setCodeInput("");
        toast.success(`${res.data.code} applied: ${res.data.label}`);
      } else {
        setApplied(null);
        setCodeError(res.error);
      }
    });
  }

  function checkout() {
    startTransition(async () => {
      const res = await createCheckoutSession({
        items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
        discountCode: applied?.code ?? "",
      });
      if (res.ok) {
        window.location.assign(res.data.url);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="font-display text-xl font-bold">
            Your cart {hydrated && count > 0 && <span className="text-muted-foreground">({count})</span>}
          </SheetTitle>
          <SheetDescription className="sr-only">Review the items in your cart and check out</SheetDescription>
        </SheetHeader>

        {!hydrated ? (
          <div className="grid flex-1 place-items-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading cart" />
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-ember-soft">
              <ShoppingBag className="size-7 text-ember-strong" aria-hidden />
            </div>
            <div>
              <p className="font-display text-xl font-bold">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">The Big Sip bottle is a great place to start. Just saying.</p>
            </div>
            <Button asChild className="h-11 rounded-full px-6" onClick={close}>
              <Link href="/shop">
                Shop bestsellers <ArrowRight aria-hidden />
              </Link>
            </Button>
          </div>
        ) : (
          <>
            {hasPhysical && (
              <div className="border-b bg-paper px-5 py-3">
                <p className="text-sm">
                  {remainingForFree > 0 ? (
                    <>
                      You&apos;re <strong>{formatPrice(remainingForFree)}</strong> away from free shipping
                    </>
                  ) : (
                    <strong>You&apos;ve unlocked free shipping 🎉</strong>
                  )}
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to free shipping">
                  <div className="h-full rounded-full bg-ember transition-[width] duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <ul className="flex-1 divide-y overflow-y-auto px-5" aria-label="Cart items">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-4 py-4">
                  <Link href={`/products/${line.slug}`} onClick={close} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {line.imageUrl && <Image src={line.imageUrl} alt="" fill sizes="80px" className="object-cover" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/products/${line.slug}`} onClick={close} className="line-clamp-2 text-sm leading-snug font-semibold hover:underline">
                          {line.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {line.type === "DIGITAL" ? (
                            <span className="inline-flex items-center gap-1">
                              <Download className="size-3" aria-hidden /> Instant download
                            </span>
                          ) : (
                            line.variantLabel
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums">{formatPriceExact(line.unitPriceCents * line.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      {line.type === "PHYSICAL" ? (
                        <QuantityStepper value={line.quantity} max={line.maxQuantity} label={line.name} onChange={(n) => setQuantity(line.variantId, n)} />
                      ) : (
                        <span className="text-xs text-muted-foreground">Qty 1</span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          remove(line.variantId);
                          toast(`Removed ${line.name}`);
                        }}
                        className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        aria-label={`Remove ${line.name} from cart`}
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <SheetFooter className="gap-3 border-t bg-background px-5 py-4">
              {applied ? (
                <div className="flex items-center justify-between rounded-xl bg-ember-soft px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <Tag className="size-4 text-ember-strong" aria-hidden /> {applied.code}
                    <span className="font-normal text-muted-foreground">{applied.label}</span>
                  </span>
                  <button type="button" onClick={() => setApplied(null)} className="grid size-7 place-items-center rounded-full hover:bg-white/60" aria-label={`Remove code ${applied.code}`}>
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              ) : (
                <form onSubmit={applyCode} className="space-y-1">
                  <div className="flex gap-2">
                    <label htmlFor="discount-code" className="sr-only">
                      Discount code
                    </label>
                    <input
                      id="discount-code"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                      placeholder="Discount code"
                      autoComplete="off"
                      aria-invalid={Boolean(codeError)}
                      aria-describedby={codeError ? "discount-error" : undefined}
                      className="h-10 min-w-0 flex-1 rounded-full border border-input bg-white px-4 text-sm uppercase outline-none placeholder:normal-case focus-visible:ring-2 focus-visible:ring-ember"
                    />
                    <Button type="submit" variant="outline" className="h-10 rounded-full px-4" disabled={!codeInput || codePending}>
                      {codePending ? <Loader2 className="animate-spin" aria-hidden /> : "Apply"}
                    </Button>
                  </div>
                  {codeError && (
                    <p id="discount-error" role="alert" className="px-4 text-xs text-destructive">
                      {codeError}
                    </p>
                  )}
                </form>
              )}

              {applied && belowMinimum && (
                <p className="px-1 text-xs text-muted-foreground">
                  {applied.code} needs a subtotal of {formatPrice(applied.minSubtotalCents ?? 0)} or more.
                </p>
              )}
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatPriceExact(subtotal)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <dt>Discount</dt>
                    <dd className="tabular-nums">−{formatPriceExact(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping & tax</dt>
                  <dd className="text-muted-foreground">{hasPhysical ? "Calculated at checkout" : "No shipping needed"}</dd>
                </div>
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <dt>Estimated total</dt>
                  <dd className="tabular-nums">{formatPriceExact(subtotal - discount)}</dd>
                </div>
              </dl>

              <Button onClick={checkout} disabled={pending} className="h-12 w-full rounded-full bg-ember text-base font-bold text-ink hover:bg-ember/90">
                {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Lock aria-hidden />}
                {pending ? "Heading to secure checkout…" : "Checkout"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Secure checkout by Stripe. Digital products are delivered instantly.</p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
