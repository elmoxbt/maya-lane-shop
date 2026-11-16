"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useCart } from "@/stores/cart-store";

export function CheckoutCancelledToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const open = useCart((s) => s.open);
  useEffect(() => {
    if (params.get("checkout") !== "cancelled") return;
    toast("Checkout cancelled", { description: "No worries, your cart is saved.", action: { label: "Open cart", onClick: open } });
    const next = new URLSearchParams(params);
    next.delete("checkout");
    router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [params, router, pathname, open]);
  return null;
}
