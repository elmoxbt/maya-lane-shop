"use client";

import { ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/stores/cart-store";

export function CartButton() {
  const count = useCart((s) => cartCount(s.lines));
  const hydrated = useCart((s) => s.hydrated);
  const open = useCart((s) => s.open);
  const shown = hydrated ? count : 0;
  return (
    <button
      type="button"
      onClick={open}
      className="relative grid size-11 place-items-center rounded-full transition hover:bg-muted"
      aria-label={`Open cart, ${shown} ${shown === 1 ? "item" : "items"}`}
    >
      <ShoppingBag className="size-5" aria-hidden />
      {shown > 0 && (
        <span className="absolute top-1 right-0.5 grid min-w-5 place-items-center rounded-full bg-ember px-1 text-[11px] leading-5 font-bold text-ink tabular-nums">
          {shown}
        </span>
      )}
    </button>
  );
}
