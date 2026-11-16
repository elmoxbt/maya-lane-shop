"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart-store";
import { refreshCart, syncCart } from "@/server/actions/cart";

/**
 * Keeps the cart honest:
 * - guests: cart lives in localStorage and is re-priced against the DB on load
 * - signed in: on first load after sign-in the guest cart is merged into the saved DB cart,
 *   then every change is pushed to the DB (debounced)
 * - sign out: the local cart is cleared so the next person on this device starts fresh
 */
export function CartSync({ userId }: { userId: string | null }) {
  const hydrated = useCart((s) => s.hydrated);
  const revision = useCart((s) => s.revision);
  const lastUser = useRef<string | null | undefined>(undefined);
  const ready = useRef(false);

  // Load the persisted cart from localStorage once on the client
  useEffect(() => {
    if (useCart.getState().hydrated) return;
    Promise.resolve(useCart.persist.rehydrate()).finally(() => useCart.setState({ hydrated: true }));
  }, []);

  // Initial reconciliation (and whenever the signed-in user changes)
  useEffect(() => {
    if (!hydrated || lastUser.current === userId) return;
    const previous = lastUser.current;
    lastUser.current = userId;
    ready.current = false;

    const storageKey = "maya-lane-cart-owner";
    let owner: string | null = null;
    try {
      owner = localStorage.getItem(storageKey);
    } catch {}

    (async () => {
      const { lines, replace } = useCart.getState();
      const payload = lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));

      if (!userId) {
        // Signed out after being signed in: start fresh
        if (owner || previous) {
          replace([]);
          try {
            localStorage.removeItem(storageKey);
          } catch {}
        } else if (payload.length) {
          const res = await refreshCart(payload);
          if (res.ok) {
            replace(res.data.lines);
            res.data.notices.forEach((n) => toast.info(n));
          }
        }
        ready.current = true;
        return;
      }

      // Merge only when this device's cart belonged to a guest; otherwise the DB is the truth
      const res = await syncCart({ lines: owner === userId ? [] : payload, mode: "merge" });
      if (res.ok) {
        replace(res.data.lines);
        res.data.notices.forEach((n) => toast.info(n));
      }
      try {
        localStorage.setItem(storageKey, userId);
      } catch {}
      ready.current = true;
    })();
  }, [hydrated, userId]);

  // Push local changes for signed-in users
  useEffect(() => {
    if (!userId || !ready.current || revision === 0) return;
    const t = setTimeout(async () => {
      const lines = useCart.getState().lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
      await syncCart({ lines, mode: "replace" });
    }, 600);
    return () => clearTimeout(t);
  }, [revision, userId]);

  return null;
}
