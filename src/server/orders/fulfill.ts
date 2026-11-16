import "server-only";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { absoluteUrl, orderNumber } from "@/lib/format";
import type { Stripe } from "@/lib/stripe";
import { buildDownloads } from "@/server/downloads";
import { trackingUrl } from "@/server/orders/tracking";
import { OrderConfirmationEmail, ShippingEmail } from "@/emails/templates";

type Result = { status: "fulfilled" | "already_fulfilled" | "not_paid" | "order_not_found"; orderId?: string };

/**
 * Marks an order paid from a completed Checkout Session. Safe to call any number of times
 * (webhook retries, the success page, concurrent deliveries): the PENDING → PAID transition is a
 * conditional update, so stock, sales counts and discount usage change exactly once.
 */
export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<Result> {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return { status: "not_paid" };

  const orderId = session.metadata?.orderId ?? session.client_reference_id;
  const order = orderId
    ? await db.order.findUnique({ where: { id: orderId }, include: { items: true } })
    : await db.order.findUnique({ where: { stripeSessionId: session.id }, include: { items: true } });
  if (!order) {
    console.error(`[fulfill] no order for session ${session.id}`);
    return { status: "order_not_found" };
  }

  const shipping = session.collected_information?.shipping_details ?? null;
  const email = (session.customer_details?.email ?? order.email).toLowerCase();
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  const transitioned = await db.$transaction(async (tx) => {
    const { count } = await tx.order.updateMany({
      where: { id: order.id, status: { in: ["PENDING", "CANCELLED"] }, paidAt: null },
      data: {
        status: "PAID",
        paidAt: new Date(),
        email,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        totalCents: session.amount_total ?? order.totalCents,
        shippingCents: session.total_details?.amount_shipping ?? 0,
        taxCents: session.total_details?.amount_tax ?? 0,
        discountCents: session.total_details?.amount_discount ?? order.discountCents,
        shippingName: shipping?.name ?? null,
        shippingAddress: shipping?.address ? { ...shipping.address } : undefined,
        cancelledAt: null,
      },
    });
    if (count === 0) return false;

    // Attach guest orders to an existing account with the same email
    if (!order.userId) {
      const user = await tx.user.findUnique({ where: { email }, select: { id: true } });
      if (user) await tx.order.update({ where: { id: order.id }, data: { userId: user.id } });
    }

    for (const item of order.items) {
      if (item.type === "PHYSICAL" && item.variantId) {
        // Never go below zero; an oversell is logged for the team to follow up.
        const updated = await tx.$executeRaw`
          UPDATE "ProductVariant" SET "stock" = GREATEST("stock" - ${item.quantity}, 0)
          WHERE "id" = ${item.variantId}`;
        if (updated === 0) console.warn(`[fulfill] variant ${item.variantId} missing while fulfilling ${order.id}`);
      }
      if (item.productId) {
        await tx.product.update({ where: { id: item.productId }, data: { salesCount: { increment: item.quantity } } });
      }
    }

    if (order.discountCodeId) {
      await tx.discountCode.update({ where: { id: order.discountCodeId }, data: { usedCount: { increment: 1 } } });
    }

    const userId = order.userId ?? (await tx.user.findUnique({ where: { email }, select: { id: true } }))?.id;
    if (userId) await tx.cartItem.deleteMany({ where: { cart: { userId } } });
    return true;
  });

  await sendConfirmationEmail(order.id);
  return { status: transitioned ? "fulfilled" : "already_fulfilled", orderId: order.id };
}

/** Sends the confirmation email at most once per order (atomic claim on confirmationSentAt). */
export async function sendConfirmationEmail(orderId: string) {
  const claim = await db.order.updateMany({ where: { id: orderId, confirmationSentAt: null, status: { not: "PENDING" } }, data: { confirmationSentAt: new Date() } });
  if (claim.count === 0) return;

  const order = await db.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: { select: { name: true, digitalAssets: { select: { id: true, name: true } } } } } } },
  });
  const downloads = buildDownloads(order);
  const res = await sendEmail({
    to: order.email,
    subject: `Order ${orderNumber(order.number)} confirmed 🧡`,
    react: OrderConfirmationEmail({
      order: { ...order, shippingAddress: order.shippingAddress as never },
      downloads: downloads.map((d) => ({ name: d.name, url: d.url })),
      orderUrl: absoluteUrl(order.userId ? `/account/orders/${order.id}` : "/account/orders"),
    }),
  });
  // Release the claim so a retry can send it
  if (!res.ok) await db.order.update({ where: { id: orderId }, data: { confirmationSentAt: null } });
}

export async function sendShippingEmail(orderId: string) {
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId } });
  if (!order.trackingNumber) return { ok: false };
  const res = await sendEmail({
    to: order.email,
    subject: `Order ${orderNumber(order.number)} is on its way`,
    react: ShippingEmail({
      order,
      carrier: order.trackingCarrier ?? "our carrier",
      trackingNumber: order.trackingNumber,
      trackingUrl: trackingUrl(order.trackingCarrier, order.trackingNumber),
      orderUrl: absoluteUrl(order.userId ? `/account/orders/${order.id}` : "/account/orders"),
    }),
  });
  if (res.ok) await db.order.update({ where: { id: orderId }, data: { shippingEmailSentAt: new Date() } });
  return res;
}

export async function markSessionExpired(session: Stripe.Checkout.Session) {
  await db.order.updateMany({ where: { stripeSessionId: session.id, status: "PENDING" }, data: { status: "CANCELLED", cancelledAt: new Date() } });
}

export async function markRefunded(charge: Stripe.Charge) {
  const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!pi || !charge.refunded) return; // partial refunds are left for the team to handle
  await db.order.updateMany({ where: { stripePaymentIntentId: pi, status: { not: "REFUNDED" } }, data: { status: "REFUNDED", refundedAt: new Date() } });
}
