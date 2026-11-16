"use client";

import { toast } from "sonner";
import { useCart, type CartLine } from "@/stores/cart-store";

export function useAddToCart() {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  return (line: Omit<CartLine, "quantity">, quantity = 1) => {
    const { added, capped } = add(line, quantity);
    if (added === 0) {
      toast.info(line.type === "DIGITAL" ? `${line.name} is already in your cart` : `You've got the max available of ${line.name} in your cart`);
      open();
      return;
    }
    toast.success(`Added ${line.name}${line.variantLabel ? ` (${line.variantLabel})` : ""}`, {
      description: capped ? "We added what's left in stock." : undefined,
      action: { label: "View cart", onClick: open },
    });
    open();
  };
}
