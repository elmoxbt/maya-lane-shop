import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { getAdminOrder } from "@/server/queries/admin";
import { OrderSummary } from "@/components/account/order-summary";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { OrderActions } from "@/components/admin/order-actions";
import { formatDate, orderNumber } from "@/lib/format";

export const metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const timeline = [
    { label: "Placed", at: order.createdAt },
    { label: "Paid", at: order.paidAt },
    { label: "Confirmation email sent", at: order.confirmationSentAt },
    { label: "Shipped", at: order.shippedAt },
    { label: "Shipping email sent", at: order.shippingEmailSentAt },
    { label: "Delivered", at: order.deliveredAt },
    { label: "Refunded", at: order.refundedAt },
    { label: "Cancelled", at: order.cancelledAt },
  ].filter((e) => e.at);

  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> Orders
      </Link>
      <div className="mt-3 mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{orderNumber(order.number)}</h1>
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-muted-foreground">{formatDate(order.createdAt, { dateStyle: "medium", timeStyle: "short" })}</span>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <OrderSummary order={order} />
        <aside className="space-y-4">
          <OrderActions
            key={`${order.status}-${order.trackingNumber ?? ""}`}
            order={{ id: order.id, status: order.status, hasPhysical: order.hasPhysical, trackingCarrier: order.trackingCarrier, trackingNumber: order.trackingNumber, canRefund: Boolean(order.stripePaymentIntentId) }}
          />
          <section className="rounded-2xl border bg-white p-5 text-sm">
            <h2 className="font-semibold">Customer</h2>
            <p className="mt-2">{order.user?.name ?? order.shippingName ?? "Guest"}</p>
            <a href={`mailto:${order.email}`} className="inline-flex items-center gap-1.5 text-ember-strong hover:underline">
              <Mail className="size-3.5" aria-hidden /> {order.email}
            </a>
            <p className="mt-2 text-muted-foreground">{order.user ? `${order.user._count.orders} orders · customer since ${formatDate(order.user.createdAt)}` : "Checked out as a guest"}</p>
          </section>
          <section className="rounded-2xl border bg-white p-5 text-sm">
            <h2 className="font-semibold">Timeline</h2>
            <ol className="mt-3 space-y-3 border-l pl-4">
              {timeline.map((e) => (
                <li key={e.label} className="relative">
                  <span className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-ink" aria-hidden />
                  <p className="font-medium">{e.label}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(e.at!, { dateStyle: "medium", timeStyle: "short" })}</p>
                </li>
              ))}
            </ol>
          </section>
          {order.stripePaymentIntentId && (
            <p className="px-1 text-xs text-muted-foreground">
              Stripe payment: <span className="font-mono">{order.stripePaymentIntentId}</span>
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
