import "server-only";
import { db } from "@/lib/db";
import { computeDiscount, describeDiscount, type DiscountRule } from "@/lib/discounts";
import { formatPrice } from "@/lib/format";

type Validation = { ok: true; rule: DiscountRule & { id: string }; label: string; discountCents: number } | { ok: false; error: string };

/** Validates a code against expiry, usage limits and minimum subtotal. */
export async function validateDiscount(code: string, subtotalCents: number): Promise<Validation> {
  const dc = await db.discountCode.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!dc || !dc.active) return { ok: false, error: "That code isn't valid." };
  if (dc.expiresAt && dc.expiresAt < new Date()) return { ok: false, error: "That code has expired." };
  if (dc.maxUses != null && dc.usedCount >= dc.maxUses) return { ok: false, error: "That code has reached its usage limit." };
  if (dc.minSubtotalCents && subtotalCents < dc.minSubtotalCents) {
    return { ok: false, error: `Spend ${formatPrice(dc.minSubtotalCents)} or more to use ${dc.code}.` };
  }
  const rule = { id: dc.id, code: dc.code, type: dc.type, value: dc.value, minSubtotalCents: dc.minSubtotalCents };
  return { ok: true, rule, label: describeDiscount(rule), discountCents: computeDiscount(rule, subtotalCents) };
}
