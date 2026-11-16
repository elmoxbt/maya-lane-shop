import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe, type Stripe } from "@/lib/stripe";
import { fulfillCheckoutSession, markRefunded, markSessionExpired } from "@/server/orders/fulfill";

export const runtime = "nodejs";

/**
 * Stripe webhook.
 * 1. Verifies the signature against the raw body.
 * 2. Skips events already recorded in StripeEvent (fast path for retries).
 * 3. Handles the event. Handlers are themselves idempotent, so a crash between steps 3 and 4
 *    just means Stripe retries and the handler no-ops.
 * 4. Records the event id.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.warn("[webhook] signature verification failed", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const seen = await db.stripeEvent.findUnique({ where: { id: event.id } });
  if (seen) return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckoutSession(event.data.object);
        break;
      case "checkout.session.expired":
        await markSessionExpired(event.data.object);
        break;
      case "charge.refunded":
        await markRefunded(event.data.object);
        break;
      default:
        break;
    }
  } catch (err) {
    console.error(`[webhook] failed handling ${event.type} ${event.id}`, err);
    // 500 makes Stripe retry with backoff
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  await db.stripeEvent.upsert({ where: { id: event.id }, create: { id: event.id, type: event.type }, update: {} });
  return NextResponse.json({ received: true });
}
