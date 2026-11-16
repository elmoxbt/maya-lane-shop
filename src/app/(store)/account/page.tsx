import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, ShieldAlert } from "lucide-react";
import { requireUser } from "@/server/auth-guards";
import { getUserDownloads, getUserOrders } from "@/server/queries/orders";
import { OrderList } from "@/components/account/order-list";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const user = await requireUser("/account");
  const { denied } = await searchParams;
  const [orders, downloads] = await Promise.all([getUserOrders(user.id), getUserDownloads(user.id)]);

  return (
    <div className="space-y-10">
      {denied === "admin" && (
        <p role="alert" className="flex items-center gap-2 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          <ShieldAlert className="size-4" aria-hidden /> The dashboard is only available to admins.
        </p>
      )}
      <dl className="grid grid-cols-3 gap-3">
        {[
          ["Orders", orders.length],
          ["Downloads", downloads.length],
          ["Lane Club since", orders.length ? new Date(orders[orders.length - 1].createdAt).getFullYear() : new Date().getFullYear()],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-3xl bg-paper p-4 sm:p-6">
            <dt className="text-xs text-muted-foreground sm:text-sm">{label}</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold sm:text-4xl">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="recent-orders">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-orders" className="font-display text-2xl font-bold">
            Recent orders
          </h2>
          {orders.length > 3 && (
            <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm font-semibold">
              View all <ArrowRight className="size-4" aria-hidden />
            </Link>
          )}
        </div>
        <OrderList orders={orders.slice(0, 3)} />
      </section>

      {downloads.length > 0 && (
        <section aria-labelledby="quick-downloads">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="quick-downloads" className="font-display text-2xl font-bold">
              Your programs & guides
            </h2>
            <Link href="/account/downloads" className="inline-flex items-center gap-1 text-sm font-semibold">
              All downloads <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {downloads.slice(0, 4).map((d) => (
              <li key={d.assetId}>
                <a href={d.url} download className="flex items-center justify-between gap-3 rounded-3xl border bg-white p-5 transition hover:border-ink">
                  <span>
                    <span className="block font-semibold">{d.productName}</span>
                    <span className="text-sm text-muted-foreground">{d.name}</span>
                  </span>
                  <Download className="size-5 shrink-0" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
