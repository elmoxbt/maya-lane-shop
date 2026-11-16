"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { ProductCardData } from "@/server/queries/products";
import { useAddToCart } from "@/hooks/use-add-to-cart";

/** One-tap add for single-variant products; otherwise a shortcut to choose options. */
export function QuickAdd({ product }: { product: ProductCardData }) {
  const addToCart = useAddToCart();
  const cls =
    "absolute right-3 bottom-3 z-10 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold shadow-md transition hover:bg-ember focus-visible:opacity-100 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100";
  if (!product.defaultVariantId) {
    return (
      <Link href={`/products/${product.slug}`} className={cls} aria-label={`Choose options for ${product.name}`}>
        Choose options
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      aria-label={`Add ${product.name} to cart`}
      onClick={() =>
        addToCart({
          variantId: product.defaultVariantId!,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          variantLabel: null,
          imageUrl: product.images[0]?.url ?? null,
          unitPriceCents: product.priceCents,
          type: product.type,
          maxQuantity: product.defaultVariantMax,
        })
      }
    >
      <Plus className="size-4" aria-hidden /> Add
    </button>
  );
}
