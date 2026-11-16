import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { formatDate, formatPriceExact, orderNumber, pluralize } from "@/lib/format";

type Row = { id: string; number: number; status: string; createdAt: Date; totalCents: number; items: { name: string; imageUrl: string | null; quantity: number }[] };

export function OrderList({ orders }: { orders: Row[] }) {
  if (!orders.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed px-6 py-16 text-center">
        <Package className="size-8 text-muted-foreground" aria-hidden />
        <p className="mt-3 font-display text-xl font-bold">No orders yet</p>
        <p className="mt-1 text-sm text-muted-foreground">When you place an order, it&apos;ll show up here.</p>
        <Link href="/shop" className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white">
          Start shopping
        </Link>
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.id}`} className="flex items-center gap-4 rounded-3xl border bg-white p-4 transition hover:border-ink sm:p-5">
            <div className="flex -space-x-3">
              {o.items.slice(0, 3).map((i, idx) => (
                <div key={idx} className="relative size-12 overflow-hidden rounded-xl border-2 border-white bg-muted sm:size-14">
                  {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
                </div>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                {orderNumber(o.number)} <OrderStatusBadge status={o.status} />
              </p>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {formatDate(o.createdAt)} · {pluralize(o.items.reduce((s, i) => s + i.quantity, 0), "item")} · {formatPriceExact(o.totalCents)}
              </p>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
