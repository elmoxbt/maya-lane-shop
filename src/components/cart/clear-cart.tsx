"use client";

import { useEffect } from "react";
import { useCart } from "@/stores/cart-store";

/** Empties the cart after a successful checkout (the DB cart is cleared by fulfilment). */
export function ClearCart() {
  const hydrated = useCart((s) => s.hydrated);
  useEffect(() => {
    if (hydrated) useCart.getState().replace([]);
  }, [hydrated]);
  return null;
}
