"use client";

import { Gift } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart-store";
import type { GiftBundleData } from "@/server/queries/gift-guide";

export function AddBundleButton({ bundle }: { bundle: GiftBundleData }) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const suggestCode = useCart((s) => s.suggestCode);
  const available = bundle.items.filter((i) => i.variant && i.variant.max > 0);
  const disabled = available.length < bundle.items.length;

  function addAll() {
    for (const item of available) {
      add(
        {
          variantId: item.variant!.id,
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          variantLabel: item.variant!.label,
          imageUrl: item.imageUrl,
          unitPriceCents: item.priceCents,
          type: item.type,
          maxQuantity: item.variant!.max,
        },
        1,
      );
    }
    if (bundle.code) suggestCode(bundle.code);
    toast.success(`${bundle.title} added`, { description: bundle.code ? `${bundle.code} will be applied in your cart.` : undefined });
    open();
  }

  return (
    <button
      type="button"
      onClick={addAll}
      disabled={disabled}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ember px-6 font-bold text-ink transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
    >
      <Gift className="size-4" aria-hidden />
      {disabled ? "Part of this bundle is sold out" : "Add the whole bundle"}
    </button>
  );
}
