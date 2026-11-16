import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { requireUser } from "@/server/auth-guards";
import { getUserOrder } from "@/server/queries/orders";
import { buildDownloads } from "@/server/downloads";
import { DownloadList, OrderSummary } from "@/components/account/order-summary";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { formatDate, orderNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function OrderDetailPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const user = await requireUser(`/account/orders/${id}`);
  const order = await getUserOrder(user.id, id);
  if (!order) notFound();
  const downloads = buildDownloads(order);

  const steps = order.hasPhysical
    ? [
        { label: "Ordered", at: order.paidAt ?? order.createdAt },
        { label: "Shipped", at: order.shippedAt },
        { label: "Delivered", at: order.deliveredAt },
      ]
    : [
        { label: "Ordered", at: order.paidAt ?? order.createdAt },
        { label: "Ready to download", at: order.paidAt },
      ];

  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All orders
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl font-extrabold">{orderNumber(order.number)}</h2>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.status !== "REFUNDED" && order.status !== "CANCELLED" && (
        <ol className="grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Order progress">
          {steps.map((s) => (
            <li key={s.label} className={cn("flex items-center gap-3 rounded-2xl border p-4", s.at ? "border-ink bg-white" : "border-dashed text-muted-foreground")}>
              <span className={cn("grid size-7 shrink-0 place-items-center rounded-full", s.at ? "bg-ink text-white" : "bg-muted")}>{s.at && <Check className="size-4" aria-hidden />}</span>
              <span className="text-sm">
                <span className="block font-semibold">{s.label}</span>
                {s.at ? formatDate(s.at) : "Pending"}
              </span>
            </li>
          ))}
        </ol>
      )}
      {order.status === "REFUNDED" && <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-800">This order was refunded{order.refundedAt ? ` on ${formatDate(order.refundedAt)}` : ""}. Downloads are no longer available.</p>}

      <DownloadList downloads={downloads} />
      <OrderSummary order={order} />
    </div>
  );
}
