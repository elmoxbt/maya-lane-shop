import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { getOverview } from "@/server/queries/admin";
import { PageHeader } from "@/components/admin/page-header";
import { StatTile } from "@/components/admin/stat-tile";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { formatDate, formatPrice, formatPriceExact, orderNumber, variantLabel } from "@/lib/format";

export const metadata = { title: "Overview" };

export default async function AdminOverviewPage() {
  const o = await getOverview();
  return (
    <>
      <PageHeader title="Overview" description="Last 30 days, paid orders only. Refunds are excluded from revenue." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Revenue" value={formatPrice(o.revenue)} change={o.revenueChange} />
        <StatTile label="Orders" value={o.orders.toLocaleString()} change={o.ordersChange} />
        <StatTile label="Average order value" value={formatPriceExact(o.aov)} change={o.aovChange} />
        <StatTile label="Email subscribers" value={o.subscribers.toLocaleString()} hint={`+${o.newSubscribers} in the last 30 days`} />
      </div>

      <section className="mt-4 rounded-2xl border bg-white p-5" aria-labelledby="rev-heading">
        <h2 id="rev-heading" className="font-semibold">
          Revenue, last 30 days
        </h2>
        <p className="text-sm text-muted-foreground">Daily paid revenue including shipping</p>
        <div className="mt-4">
          <RevenueChart data={o.daily} />
        </div>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 [&>*]:min-w-0">
        <section className="rounded-2xl border bg-white p-5" aria-labelledby="top-heading">
          <h2 id="top-heading" className="font-semibold">
            Top products
          </h2>
          {o.topProducts.length ? (
            <ol className="mt-4 space-y-3">
              {o.topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="w-4 text-sm font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
                  <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">{p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-cover" />}</div>
                  <Link href={`/admin/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">
                    {p.name}
                  </Link>
                  <span className="text-sm text-muted-foreground tabular-nums">{p.units} sold</span>
                  <span className="w-20 text-right text-sm font-semibold tabular-nums">{formatPrice(p.revenue)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No sales in the last 30 days yet.</p>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-5" aria-labelledby="recent-heading">
          <div className="flex items-center justify-between">
            <h2 id="recent-heading" className="font-semibold">
              Recent orders
            </h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold">
              All orders <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="mt-3 divide-y">
            {o.recent.map((r) => (
              <li key={r.id}>
                <Link href={`/admin/orders/${r.id}`} className="flex items-center gap-3 py-2.5 text-sm hover:bg-muted/50">
                  <span className="w-16 shrink-0 font-semibold">{orderNumber(r.number)}</span>
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{r.email}</span>
                  <OrderStatusBadge status={r.status} />
                  <span className="hidden w-16 shrink-0 text-right text-muted-foreground sm:inline">{formatDate(r.createdAt, { month: "short", day: "numeric" })}</span>
                  <span className="w-20 text-right font-semibold tabular-nums">{formatPriceExact(r.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {o.lowStock.length > 0 && (
        <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-5" aria-labelledby="stock-heading">
          <h2 id="stock-heading" className="flex items-center gap-2 font-semibold text-amber-900">
            <AlertTriangle className="size-4" aria-hidden /> Low stock
          </h2>
          <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {o.lowStock.map((v) => (
              <li key={v.id}>
                <Link href={`/admin/products/${v.product.id}`} className="flex justify-between rounded-xl bg-white px-3 py-2 text-sm hover:shadow-sm">
                  <span className="truncate">
                    {v.product.name} <span className="text-muted-foreground">· {variantLabel(v)}</span>
                  </span>
                  <span className={v.stock === 0 ? "font-semibold text-destructive" : "font-semibold text-amber-800"}>{v.stock === 0 ? "Sold out" : `${v.stock} left`}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
