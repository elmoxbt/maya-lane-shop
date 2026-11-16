export type DiscountRule = {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minSubtotalCents: number | null;
};

/** Discount amount in cents for a subtotal. Pure, shared by the cart UI and the checkout server action. */
export function computeDiscount(rule: DiscountRule, subtotalCents: number) {
  if (rule.minSubtotalCents && subtotalCents < rule.minSubtotalCents) return 0;
  const raw = rule.type === "PERCENTAGE" ? Math.round((subtotalCents * rule.value) / 100) : rule.value;
  return Math.max(0, Math.min(raw, subtotalCents));
}

export function describeDiscount(rule: Pick<DiscountRule, "type" | "value">) {
  return rule.type === "PERCENTAGE" ? `${rule.value}% off` : `$${(rule.value / 100).toFixed(rule.value % 100 ? 2 : 0)} off`;
}
