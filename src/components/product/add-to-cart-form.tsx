"use client";

import { useMemo, useState } from "react";
import { Download, ShoppingBag, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { formatPrice, variantLabel } from "@/lib/format";
import { siteConfig } from "@/config/site";

type Variant = { id: string; size: string | null; color: string | null; colorHex: string | null; stock: number; priceCents: number | null };
type Props = {
  product: { id: string; slug: string; name: string; type: "PHYSICAL" | "DIGITAL"; priceCents: number; imageUrl: string | null };
  variants: Variant[];
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

export function AddToCartForm({ product, variants }: Props) {
  const digital = product.type === "DIGITAL";
  const colors = useMemo(() => {
    const m = new Map<string, string | null>();
    variants.forEach((v) => v.color && m.set(v.color, v.colorHex));
    return [...m].map(([name, hex]) => ({ name, hex }));
  }, [variants]);
  const sizes = useMemo(() => [...new Set(variants.map((v) => v.size).filter(Boolean) as string[])].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)), [variants]);

  const firstInStock = variants.find((v) => digital || v.stock > 0) ?? variants[0];
  const [color, setColor] = useState<string | null>(firstInStock?.color ?? null);
  const [size, setSize] = useState<string | null>(sizes.length ? null : (firstInStock?.size ?? null));
  const [qty, setQty] = useState(1);
  const [showSizeError, setShowSizeError] = useState(false);
  const addToCart = useAddToCart();

  const selected = variants.find((v) => (v.color ?? null) === color && (v.size ?? null) === size) ?? (sizes.length ? undefined : variants.find((v) => (v.color ?? null) === color));
  const stockFor = (c: string | null, s: string | null) => variants.find((v) => (v.color ?? null) === c && (v.size ?? null) === s)?.stock ?? 0;
  const colorHasStock = (c: string) => variants.some((v) => v.color === c && v.stock > 0);

  const maxQty = digital ? 1 : Math.min(10, selected?.stock ?? 0);
  const soldOut = !digital && selected != null && selected.stock <= 0;
  const lowStock = !digital && selected && selected.stock > 0 && selected.stock <= 5;
  const price = selected?.priceCents ?? product.priceCents;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (sizes.length && !size) {
      setShowSizeError(true);
      document.getElementById("size-picker")?.focus();
      return;
    }
    if (!selected || soldOut) return;
    addToCart(
      {
        variantId: selected.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantLabel: variantLabel(selected),
        imageUrl: product.imageUrl,
        unitPriceCents: price,
        type: product.type,
        maxQuantity: maxQty,
      },
      qty,
    );
    setQty(1);
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {colors.length > 0 && (
        <fieldset>
          <legend className="mb-3 text-sm">
            <span className="font-semibold">Colour:</span> <span className="text-muted-foreground">{color}</span>
          </legend>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((c) => {
              const available = colorHasStock(c.name);
              return (
                <label key={c.name} className="relative cursor-pointer" title={available ? c.name : `${c.name} (sold out)`}>
                  <input
                    type="radio"
                    name="color"
                    value={c.name}
                    checked={color === c.name}
                    onChange={() => {
                      setColor(c.name);
                      setQty(1);
                    }}
                    className="peer sr-only"
                  />
                  <span className="sr-only">
                    {c.name}
                    {!available && " (sold out)"}
                  </span>
                  <span
                    aria-hidden
                    className={cn("block size-10 rounded-full border border-black/10 ring-2 ring-transparent ring-offset-2 transition peer-checked:ring-ink peer-focus-visible:ring-ember", !available && "opacity-40")}
                    style={{ backgroundColor: c.hex ?? "#ddd" }}
                  />
                  {!available && <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 h-0.5 w-11 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink/60" />}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {sizes.length > 0 && (
        <fieldset id="size-picker" tabIndex={-1} aria-describedby={showSizeError ? "size-error" : undefined} className="outline-none">
          <legend className="mb-3 flex w-full items-center justify-between text-sm">
            <span>
              <span className="font-semibold">Size:</span> <span className="text-muted-foreground">{size ?? "Choose a size"}</span>
            </span>
          </legend>
          <div className="grid grid-cols-5 gap-2">
            {sizes.map((s) => {
              const stock = stockFor(color, s);
              return (
                <label key={s} className="cursor-pointer">
                  <input
                    type="radio"
                    name="size"
                    value={s}
                    checked={size === s}
                    disabled={stock <= 0}
                    onChange={() => {
                      setSize(s);
                      setShowSizeError(false);
                      setQty(1);
                    }}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "grid h-12 place-items-center rounded-xl border text-sm font-semibold transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-ember hover:border-ink",
                      stock <= 0 && "cursor-not-allowed text-muted-foreground line-through opacity-50 hover:border-border",
                    )}
                  >
                    {s}
                    {stock <= 0 && <span className="sr-only"> (sold out)</span>}
                  </span>
                </label>
              );
            })}
          </div>
          {showSizeError && (
            <p id="size-error" role="alert" className="mt-2 text-sm text-destructive">
              Please choose a size first.
            </p>
          )}
        </fieldset>
      )}

      <div aria-live="polite" className="min-h-5 text-sm">
        {digital ? (
          <p className="inline-flex items-center gap-2 font-medium text-success">
            <Download className="size-4" aria-hidden /> Instant download after checkout
          </p>
        ) : soldOut ? (
          <p className="font-medium text-destructive">This option is sold out. Try another colour or size.</p>
        ) : lowStock ? (
          <p className="font-medium text-ember-strong">Only {selected!.stock} left in this option. Don&apos;t sleep on it!</p>
        ) : selected ? (
          <p className="inline-flex items-center gap-2 text-muted-foreground">
            <Truck className="size-4" aria-hidden /> In stock. Ships in 1–2 business days.
          </p>
        ) : null}
      </div>

      <div className="flex gap-3">
        {!digital && <QuantityStepper value={qty} max={Math.max(1, maxQty)} label={product.name} onChange={setQty} size="lg" />}
        <button
          type="submit"
          disabled={soldOut}
          className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-ember px-4 text-[15px] font-bold whitespace-nowrap text-ink sm:px-6 sm:text-base transition hover:brightness-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingBag className="size-5" aria-hidden />
          {soldOut ? "Sold out" : `Add to cart · ${formatPrice(price * qty)}`}
        </button>
      </div>
      {!digital && (
        <p className="text-sm text-muted-foreground">
          Free shipping on orders over {formatPrice(siteConfig.shipping.freeThresholdCents)}. Free 30-day returns.
        </p>
      )}
    </form>
  );
}
