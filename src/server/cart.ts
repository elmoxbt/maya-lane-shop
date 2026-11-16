import "server-only";
import { db } from "@/lib/db";
import { variantLabel } from "@/lib/format";
import type { CartLine } from "@/stores/cart-store";

export const MAX_PER_LINE = 10;

/**
 * Turns {variantId, quantity} pairs into fully priced cart lines using the database as the
 * source of truth: drops unpublished/missing items, re-prices, and clamps to available stock.
 */
export async function hydrateLines(input: { variantId: string; quantity: number }[]) {
  const ids = [...new Set(input.map((i) => i.variantId))];
  const variants = await db.productVariant.findMany({
    where: { id: { in: ids } },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  });
  const byId = new Map(variants.map((v) => [v.id, v]));
  const lines: CartLine[] = [];
  const notices: string[] = [];

  for (const item of input) {
    const v = byId.get(item.variantId);
    if (!v || !v.product.published) {
      notices.push("An item in your cart is no longer available and was removed.");
      continue;
    }
    const digital = v.product.type === "DIGITAL";
    const maxQuantity = digital ? 1 : Math.min(MAX_PER_LINE, v.stock);
    if (maxQuantity <= 0) {
      notices.push(`${v.product.name}${v.color || v.size ? ` (${variantLabel(v)})` : ""} just sold out and was removed.`);
      continue;
    }
    const quantity = Math.min(item.quantity, maxQuantity);
    if (quantity < item.quantity) notices.push(`Only ${maxQuantity} of ${v.product.name} available, so we updated your cart.`);
    const existing = lines.find((l) => l.variantId === v.id);
    if (existing) {
      existing.quantity = Math.min(existing.maxQuantity, existing.quantity + quantity);
      continue;
    }
    lines.push({
      variantId: v.id,
      productId: v.productId,
      slug: v.product.slug,
      name: v.product.name,
      variantLabel: variantLabel(v),
      imageUrl: v.product.images[0]?.url ?? null,
      unitPriceCents: v.priceCents ?? v.product.priceCents,
      type: v.product.type,
      maxQuantity,
      quantity,
    });
  }
  return { lines, notices: [...new Set(notices)] };
}

export async function readUserCart(userId: string) {
  const cart = await db.cart.findUnique({ where: { userId }, include: { items: true } });
  return cart?.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })) ?? [];
}

export async function writeUserCart(userId: string, lines: { variantId: string; quantity: number }[]) {
  await db.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {} });
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    if (lines.length) {
      await tx.cartItem.createMany({ data: lines.map((l) => ({ cartId: cart.id, variantId: l.variantId, quantity: l.quantity })) });
    }
  });
}
