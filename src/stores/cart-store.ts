"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceCents: number;
  type: "PHYSICAL" | "DIGITAL";
  /** Max purchasable (stock, capped at 10). Digital items are always 1. */
  maxQuantity: number;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  isOpen: boolean;
  /** Bumped on every user-initiated change so the DB sync knows when to push. */
  revision: number;
  hydrated: boolean;
  /** A discount code to auto-apply in the drawer (e.g. after adding a gift bundle). Not persisted. */
  suggestedCode: string | null;
  suggestCode: (code: string | null) => void;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => { added: number; capped: boolean };
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  /** Replace lines with server truth without triggering another sync. */
  replace: (lines: CartLine[]) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      isOpen: false,
      revision: 0,
      hydrated: false,
      suggestedCode: null,
      suggestCode: (suggestedCode) => set({ suggestedCode }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
      add: (line, quantity = 1) => {
        const existing = get().lines.find((l) => l.variantId === line.variantId);
        const current = existing?.quantity ?? 0;
        const next = Math.min(line.maxQuantity, current + quantity);
        const added = next - current;
        set((s) => ({
          revision: s.revision + 1,
          lines: existing
            ? s.lines.map((l) => (l.variantId === line.variantId ? { ...l, ...line, quantity: next } : l))
            : [...s.lines, { ...line, quantity: next }],
        }));
        return { added, capped: added < quantity };
      },
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          revision: s.revision + 1,
          lines: s.lines
            .map((l) => (l.variantId === variantId ? { ...l, quantity: Math.max(0, Math.min(l.maxQuantity, quantity)) } : l))
            .filter((l) => l.quantity > 0),
        })),
      remove: (variantId) => set((s) => ({ revision: s.revision + 1, lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set((s) => ({ revision: s.revision + 1, lines: [] })),
      replace: (lines) => set({ lines }),
    }),
    {
      name: "maya-lane-cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      // Rehydrated explicitly on mount (see CartSync) so server and first client render match.
      skipHydration: true,
    },
  ),
);

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
