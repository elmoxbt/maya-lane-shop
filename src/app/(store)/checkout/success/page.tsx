import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Mail, UserPlus } from "lucide-react";
import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";
import { orderNumber } from "@/lib/format";
import { getOrderBySession } from "@/server/queries/orders";
import { fulfillCheckoutSession } from "@/server/orders/fulfill";
import { buildDownloads } from "@/server/downloads";
import { DownloadList, OrderSummary } from "@/components/account/order-summary";
import { ClearCart } from "@/components/cart/clear-cart";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { AutoRefresh } from "@/components/common/auto-refresh";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { session_id } = await searchParams;
  if (typeof session_id !== "string" || !session_id.startsWith("cs_")) redirect("/");

  let order = await getOrderBySession(session_id);
  if (!order) redirect("/");

  // The webhook is the source of truth, but if it hasn't landed yet (or isn't running locally)
  // we verify the session with Stripe directly. Fulfilment is idempotent, so this is always safe.
  if (order.status === "PENDING" && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      if (session.payment_status === "paid") {
        await fulfillCheckoutSession(session);
        order = (await getOrderBySession(session_id))!;
      }
    } catch (err) {
      console.error("[success] could not verify session", err);
    }
  }

  const session = await auth();
  const paid = order.status !== "PENDING" && order.status !== "CANCELLED";
  const downloads = buildDownloads(order);

  return (
    <div className="container-page max-w-3xl py-10 sm:py-16">
      <ClearCart />
      {!paid && <AutoRefresh seconds={3} />}
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-ember-soft">
          {paid ? <CheckCircle2 className="size-8 text-success" aria-hidden /> : <Clock className="size-8 text-ember-strong" aria-hidden />}
        </span>
        <p className="mt-6 text-sm font-semibold text-muted-foreground">Order {orderNumber(order.number)}</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">{paid ? "You're the best. Thank you!" : "Confirming your payment…"}</h1>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          {paid ? (
            <>
              A confirmation is on its way to <strong className="text-foreground">{order.email}</strong>.{" "}
              {order.hasPhysical ? "We'll email tracking as soon as your order ships." : "Your downloads are ready below."}
            </>
          ) : (
            "This usually takes a few seconds. This page will update automatically."
          )}
        </p>
        <div className="mt-4">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-10 space-y-6">
        <DownloadList downloads={downloads} />
        <OrderSummary order={order} />

        {!session?.user && paid && (
          <div className="flex flex-col items-start gap-4 rounded-3xl bg-paper p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <UserPlus className="mt-0.5 size-5 shrink-0" aria-hidden />
              <div>
                <p className="font-semibold">Save your order history</p>
                <p className="text-sm text-muted-foreground">Sign in with {order.email} to track this order and re-download anytime.</p>
              </div>
            </div>
            <Link href="/login?callbackUrl=/account/orders" className="inline-flex h-11 shrink-0 items-center rounded-full bg-ink px-5 text-sm font-semibold text-white">
              Create account
            </Link>
          </div>
        )}

        <div className="flex flex-col items-center gap-3 pt-4 text-center sm:flex-row sm:justify-center">
          <Link href="/shop" className="inline-flex h-12 items-center rounded-full border px-6 font-semibold transition hover:border-ink">
            Keep shopping
          </Link>
          <a href="mailto:hello@mayalane.shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <Mail className="size-4" aria-hidden /> Questions about your order?
          </a>
        </div>
      </div>
    </div>
  );
}
