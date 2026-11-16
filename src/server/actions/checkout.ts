"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getStripe, type Stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/format";
import { fail, fromZod, ok, type ActionResult } from "@/lib/action-result";
import { checkoutSchema, discountCheckSchema } from "@/lib/validations";
import { describeDiscount, type DiscountRule } from "@/lib/discounts";
import { hydrateLines } from "@/server/cart";
import { validateDiscount } from "@/server/discounts";
import { limits, rateLimit } from "@/server/rate-limit";
import { siteConfig } from "@/config/site";

export async function checkDiscountCode(input: unknown): Promise<ActionResult<DiscountRule & { label: string }>> {
  const parsed = discountCheckSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);
  const rl = await rateLimit("discount", limits.discount);
  if (!rl.ok) return fail("Too many attempts. Try again in a few minutes.");

  const res = await validateDiscount(parsed.data.code, parsed.data.subtotalCents);
  if (!res.ok) return fail(res.error);
  const { code, type, value, minSubtotalCents } = res.rule;
  const rule = { code, type, value, minSubtotalCents };
  return ok({ ...rule, label: describeDiscount(rule) });
}

/**
 * Creates a PENDING order from DB prices (never client prices) and a Stripe Checkout Session for it.
 * The order is marked PAID only by the verified webhook (or the success page's server-side check).
 */
export async function createCheckoutSession(input: unknown): Promise<ActionResult<{ url: string }>> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);

  if (!process.env.STRIPE_SECRET_KEY) {
    return fail("Checkout isn't connected yet. Add your Stripe test keys to .env (see README) and restart the server.");
  }

  const rl = await rateLimit("checkout", limits.checkout);
  if (!rl.ok) return fail("Too many checkout attempts. Please wait a few minutes.");

  const { lines, notices } = await hydrateLines(parsed.data.items);
  if (!lines.length) return fail(notices[0] ?? "Your cart is empty.");
  const changed =
    lines.length !== parsed.data.items.length ||
    lines.some((l) => parsed.data.items.find((i) => i.variantId === l.variantId)?.quantity !== l.quantity);
  if (changed) return fail(`${notices[0] ?? "Your cart changed."} Please review your cart and try again.`);

  const subtotalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
  const hasPhysical = lines.some((l) => l.type === "PHYSICAL");

  let discountCents = 0;
  let discountCodeId: string | null = null;
  let discountCode: string | null = null;
  if (parsed.data.discountCode) {
    const d = await validateDiscount(parsed.data.discountCode, subtotalCents);
    if (!d.ok) return fail(d.error);
    discountCents = d.discountCents;
    discountCodeId = d.rule.id;
    discountCode = d.rule.code;
  }

  const session = await auth();
  const user = session?.user;
  const afterDiscount = subtotalCents - discountCents;

  const order = await db.order.create({
    data: {
      userId: user?.id,
      email: user?.email ?? "pending@checkout",
      status: "PENDING",
      hasPhysical,
      subtotalCents,
      discountCents,
      totalCents: afterDiscount,
      discountCodeId,
      items: {
        create: lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          type: l.type,
          name: l.name,
          variantLabel: l.variantLabel,
          imageUrl: l.imageUrl,
          unitPriceCents: l.unitPriceCents,
          quantity: l.quantity,
        })),
      },
    },
  });

  try {
    const stripe = getStripe();

    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (discountCents > 0) {
      // One-off coupon for the exact amount we calculated, so Stripe's total always matches ours.
      const coupon = await stripe.coupons.create({
        amount_off: discountCents,
        currency: "usd",
        duration: "once",
        max_redemptions: 1,
        name: discountCode!,
        metadata: { orderId: order.id },
      });
      discounts = [{ coupon: coupon.id }];
    }

    const freeShipping = afterDiscount >= siteConfig.shipping.freeThresholdCents;
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      customer_email: user?.email ?? undefined,
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id } },
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "usd",
          unit_amount: l.unitPriceCents,
          tax_behavior: "exclusive",
          product_data: {
            name: l.name,
            description: l.type === "DIGITAL" ? "Instant digital download" : (l.variantLabel ?? undefined),
            images: l.imageUrl ? [l.imageUrl] : undefined,
            metadata: { variantId: l.variantId, productId: l.productId },
          },
        },
      })),
      discounts,
      allow_promotion_codes: discounts ? undefined : false,
      ...(hasPhysical
        ? {
            shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU"] },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: freeShipping ? "Free standard shipping" : "Standard shipping",
                  fixed_amount: { amount: freeShipping ? 0 : siteConfig.shipping.standardCents, currency: "usd" },
                  delivery_estimate: { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "business_day", value: 6 } },
                  tax_behavior: "exclusive",
                },
              },
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: "Express shipping",
                  fixed_amount: { amount: siteConfig.shipping.expressCents, currency: "usd" },
                  delivery_estimate: { minimum: { unit: "business_day", value: 1 }, maximum: { unit: "business_day", value: 2 } },
                  tax_behavior: "exclusive",
                },
              },
            ],
          }
        : {}),
      // Tax placeholder: flip STRIPE_AUTOMATIC_TAX=true once Stripe Tax is set up in your dashboard.
      automatic_tax: { enabled: process.env.STRIPE_AUTOMATIC_TAX === "true" },
      success_url: absoluteUrl("/checkout/success?session_id={CHECKOUT_SESSION_ID}"),
      cancel_url: absoluteUrl("/shop?checkout=cancelled"),
      expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    });

    await db.order.update({ where: { id: order.id }, data: { stripeSessionId: checkout.id } });
    if (!checkout.url) throw new Error("Stripe did not return a checkout URL");
    return ok({ url: checkout.url });
  } catch (err) {
    console.error("[checkout] failed to create session", err);
    await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED", cancelledAt: new Date() } });
    return fail("We couldn't start checkout. Please try again in a moment.");
  }
}
