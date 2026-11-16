/**
 * End-to-end check of the Stripe webhook without touching Stripe's servers:
 * signs real-shaped events with Stripe's test header helper, sends them to the actual route
 * handler, and asserts fulfilment is correct and idempotent. Cleans up after itself.
 *
 *   npm run test:webhook
 */
import "dotenv/config";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import Stripe from "stripe";

process.env.STRIPE_SECRET_KEY ||= "sk_test_local_webhook_check";
process.env.STRIPE_WEBHOOK_SECRET ||= "whsec_local_webhook_check";

async function main() {
  const { db } = await import("@/lib/db");
  const { POST } = await import("@/app/api/webhooks/stripe/route");
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;

  const variant = await db.productVariant.findFirstOrThrow({ where: { stock: { gte: 5 }, product: { type: "PHYSICAL", published: true } }, include: { product: true } });
  const digital = await db.product.findFirstOrThrow({ where: { type: "DIGITAL", published: true }, include: { variants: true } });
  const code = await db.discountCode.findFirstOrThrow({ where: { code: "KICKSTART10" } });
  const before = {
    stock: variant.stock,
    physicalSales: variant.product.salesCount,
    digitalSales: digital.salesCount,
    codeUses: code.usedCount,
  };

  const sessionId = `cs_test_script_${randomBytes(6).toString("hex")}`;
  const subtotal = variant.product.priceCents * 2 + digital.priceCents;
  const order = await db.order.create({
    data: {
      email: "pending@checkout",
      status: "PENDING",
      hasPhysical: true,
      subtotalCents: subtotal,
      discountCents: Math.round(subtotal * 0.1),
      totalCents: subtotal - Math.round(subtotal * 0.1),
      discountCodeId: code.id,
      stripeSessionId: sessionId,
      items: {
        create: [
          { productId: variant.productId, variantId: variant.id, type: "PHYSICAL", name: variant.product.name, unitPriceCents: variant.product.priceCents, quantity: 2 },
          { productId: digital.id, variantId: digital.variants[0].id, type: "DIGITAL", name: digital.name, unitPriceCents: digital.priceCents, quantity: 1 },
        ],
      },
    },
  });

  const session = {
    id: sessionId,
    object: "checkout.session",
    payment_status: "paid",
    status: "complete",
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    amount_total: order.totalCents + 599,
    total_details: { amount_discount: order.discountCents, amount_shipping: 599, amount_tax: 0 },
    customer_details: { email: "Webhook.Tester@Example.com" },
    payment_intent: `pi_test_${randomBytes(6).toString("hex")}`,
    collected_information: { shipping_details: { name: "Webhook Tester", address: { line1: "1 Test St", line2: null, city: "Austin", state: "TX", postal_code: "78701", country: "US" } } },
  };

  const send = async (eventId: string, opts: { badSignature?: boolean } = {}) => {
    const payload = JSON.stringify({ id: eventId, object: "event", type: "checkout.session.completed", data: { object: session } });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: opts.badSignature ? "whsec_wrong" : secret });
    const res = await POST(new Request("http://localhost/api/webhooks/stripe", { method: "POST", body: payload, headers: { "stripe-signature": header } }));
    return { status: res.status, body: await res.json() };
  };

  let failed = false;
  try {
    const forged = await send("evt_forged", { badSignature: true });
    assert.equal(forged.status, 400, "forged signature must be rejected");
    console.log("✔ forged signature rejected (400)");

    const evtA = `evt_test_${randomBytes(6).toString("hex")}`;
    const evtB = `evt_test_${randomBytes(6).toString("hex")}`;
    // Two different deliveries racing for the same session, then an exact retry
    const [r1, r2] = await Promise.all([send(evtA), send(evtB)]);
    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200);
    const retry = await send(evtA);
    assert.equal(retry.body.duplicate, true, "retry of a processed event should short-circuit");
    console.log("✔ concurrent deliveries + retry accepted (200, duplicate detected)");

    const paid = await db.order.findUniqueOrThrow({ where: { id: order.id } });
    assert.equal(paid.status, "PAID");
    assert.equal(paid.email, "webhook.tester@example.com");
    assert.equal(paid.shippingCents, 599);
    assert.equal(paid.totalCents, session.amount_total);
    assert.equal(paid.shippingName, "Webhook Tester");
    assert.ok(paid.confirmationSentAt, "confirmation email should be marked sent");
    console.log("✔ order marked PAID with Stripe totals, email and shipping address");

    const v = await db.productVariant.findUniqueOrThrow({ where: { id: variant.id }, include: { product: true } });
    const d = await db.product.findUniqueOrThrow({ where: { id: digital.id } });
    const c = await db.discountCode.findUniqueOrThrow({ where: { id: code.id } });
    assert.equal(v.stock, before.stock - 2, "stock decremented exactly once");
    assert.equal(v.product.salesCount, before.physicalSales + 2, "sales counted exactly once");
    assert.equal(d.salesCount, before.digitalSales + 1);
    assert.equal(c.usedCount, before.codeUses + 1, "discount usage counted exactly once");
    console.log("✔ stock, sales counts and discount usage changed exactly once");

    const { buildDownloads } = await import("@/server/downloads");
    const withItems = await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: { include: { product: { select: { name: true, digitalAssets: { select: { id: true, name: true } } } } } } } });
    const links = buildDownloads(withItems);
    assert.ok(links.length >= 1, "digital item should produce a signed download link");
    console.log(`✔ ${links.length} signed download link(s) generated`);
  } catch (err) {
    failed = true;
    console.error("✘", (err as Error).message);
  } finally {
    await db.order.delete({ where: { id: order.id } });
    await db.productVariant.update({ where: { id: variant.id }, data: { stock: before.stock } });
    await db.product.update({ where: { id: variant.productId }, data: { salesCount: before.physicalSales } });
    await db.product.update({ where: { id: digital.id }, data: { salesCount: before.digitalSales } });
    await db.discountCode.update({ where: { id: code.id }, data: { usedCount: before.codeUses } });
    await db.stripeEvent.deleteMany({ where: { id: { startsWith: "evt_test_" } } });
    await db.$disconnect();
  }
  if (failed) process.exit(1);
  console.log("\nAll webhook checks passed.");
}

main();
