"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { fail, fromZod, ok } from "@/lib/action-result";
import { sendShippingEmail } from "@/server/orders/fulfill";
import { withAdmin } from "./guard";

const statusSchema = z.object({ orderId: z.string().cuid(), status: z.enum(["PAID", "SHIPPED", "DELIVERED", "REFUNDED"]) });

export async function updateOrderStatus(input: unknown) {
  return withAdmin(async () => {
    const parsed = statusSchema.safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    const { orderId, status } = parsed.data;
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order || order.status === "PENDING" || order.status === "CANCELLED") return fail("Order not found or not paid.");
    if (order.status === status) return ok(undefined, "No change.");
    if (order.status === "REFUNDED") return fail("Refunded orders can't change status.");

    let message = `Order marked ${status.toLowerCase()}.`;
    if (status === "REFUNDED") {
      // Real refund through Stripe when possible; the charge.refunded webhook then no-ops.
      if (order.stripePaymentIntentId && process.env.STRIPE_SECRET_KEY && !order.stripeSessionId?.startsWith("cs_test_seed")) {
        await getStripe().refunds.create({ payment_intent: order.stripePaymentIntentId, metadata: { orderId } });
        message = "Refund issued in Stripe and order marked refunded.";
      } else {
        message = "Order marked refunded (no Stripe payment to refund).";
      }
    }
    if (status === "SHIPPED" && !order.hasPhysical) return fail("Digital-only orders don't ship.");

    await db.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === "SHIPPED" && { shippedAt: order.shippedAt ?? new Date() }),
        ...(status === "DELIVERED" && { deliveredAt: new Date(), shippedAt: order.shippedAt ?? new Date() }),
        ...(status === "REFUNDED" && { refundedAt: new Date() }),
      },
    });
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return ok(undefined, message);
  });
}

const trackingSchema = z.object({
  orderId: z.string().cuid(),
  carrier: z.enum(["USPS", "UPS", "FedEx", "DHL"]),
  trackingNumber: z.string().trim().min(6, "Tracking numbers are at least 6 characters").max(40).regex(/^[A-Za-z0-9 -]+$/, "Letters, numbers and dashes only"),
  notify: z.boolean().default(true),
});

export async function addTracking(input: unknown) {
  return withAdmin(async () => {
    const parsed = trackingSchema.safeParse(input);
    if (!parsed.success) return fromZod(parsed.error);
    const { orderId, carrier, trackingNumber, notify } = parsed.data;
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order?.hasPhysical) return fail("This order has nothing to ship.");
    if (!["PAID", "SHIPPED"].includes(order.status)) return fail("Only paid orders can get a tracking number.");

    await db.order.update({
      where: { id: orderId },
      data: { trackingCarrier: carrier, trackingNumber: trackingNumber.replace(/\s+/g, ""), status: "SHIPPED", shippedAt: order.shippedAt ?? new Date() },
    });
    let emailed = false;
    if (notify) emailed = (await sendShippingEmail(orderId)).ok;
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");
    return ok(undefined, emailed ? "Tracking saved and shipping email sent." : "Tracking saved.");
  });
}
