import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { z } from "zod";
import { getAdminOrders } from "@/server/queries/admin";
import { PageHeader } from "@/components/admin/page-header";
import { OrderStatusBadge } from "@/components/common/order-status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatPriceExact, orderNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Orders" };

const statuses = ["PAID", "SHIPPED", "DELIVERED", "REFUNDED", "CANCELLED"] as const;
const paramsSchema = z.object({
  status: z.enum(statuses).optional().catch(undefined),
  q: z.string().trim().max(80).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(1000).optional().catch(1),
});

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const { status, q, page = 1 } = paramsSchema.parse(await searchParams);
  const { orders, total, pages, counts } = await getAdminOrders({ status, q: q || undefined, page });
  const href = (over: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, q, page, ...over };
    for (const [k, v] of Object.entries(merged)) if (v != null && v !== "" && !(k === "page" && v === 1)) p.set(k, String(v));
    return `/admin/orders${p.size ? `?${p}` : ""}`;
  };
  const allCount = Object.entries(counts).filter(([s]) => s !== "PENDING").reduce((s, [, n]) => s + (n ?? 0), 0);

  return (
    <>
      <PageHeader title="Orders" description={`${total} ${total === 1 ? "order" : "orders"}${status ? ` · ${status.toLowerCase()}` : ""}${q ? ` matching “${q}”` : ""}`} />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Filter by status" className="flex gap-1 overflow-x-auto">
          {[{ key: undefined, label: "All", n: allCount }, ...statuses.map((s) => ({ key: s, label: s.charAt(0) + s.slice(1).toLowerCase(), n: counts[s] ?? 0 }))].map((t) => (
            <Link
              key={t.label}
              href={href({ status: t.key, page: 1 })}
              aria-current={status === t.key ? "page" : undefined}
              className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition", status === t.key ? "bg-ink text-white" : "bg-white text-foreground/75 hover:bg-muted")}
            >
              {t.label} <span className="opacity-60">{t.n}</span>
            </Link>
          ))}
        </nav>
        <form role="search" className="relative w-full lg:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="order-search" className="sr-only">
            Search orders
          </label>
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input id="order-search" name="q" defaultValue={q} placeholder="Email, name or ML-1042" className="h-10 w-full rounded-full border bg-white pr-4 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ember" />
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white">
        {orders.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} className="relative">
                  <TableCell className="font-semibold">
                    <Link href={`/admin/orders/${o.id}`} className="after:absolute after:inset-0">
                      {orderNumber(o.number)}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    {o.shippingName ?? <span className="text-muted-foreground">Digital only</span>}
                    <span className="block truncate text-xs text-muted-foreground">{o.email}</span>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(o.createdAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={o.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {o.items.reduce((s, i) => s + i.quantity, 0)}
                    {o.hasPhysical ? "" : " · digital"}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{formatPriceExact(o.totalCents)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-12 text-center">
            <p className="font-semibold">No orders found</p>
            <p className="mt-1 text-sm text-muted-foreground">Try a different filter or search.</p>
            <Link href="/admin/orders" className="mt-4 inline-block text-sm font-semibold underline underline-offset-4">
              Clear filters
            </Link>
          </div>
        )}
      </div>

      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            <Link aria-disabled={page <= 1} href={href({ page: Math.max(1, page - 1) })} className={cn("inline-flex h-9 items-center gap-1 rounded-full border bg-white px-3", page <= 1 && "pointer-events-none opacity-50")}>
              <ChevronLeft className="size-4" aria-hidden /> Previous
            </Link>
            <Link aria-disabled={page >= pages} href={href({ page: Math.min(pages, page + 1) })} className={cn("inline-flex h-9 items-center gap-1 rounded-full border bg-white px-3", page >= pages && "pointer-events-none opacity-50")}>
              Next <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
