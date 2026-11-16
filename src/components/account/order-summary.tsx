import Image from "next/image";
import Link from "next/link";
import { Download, ExternalLink, FileText } from "lucide-react";
import { formatDate, formatPriceExact } from "@/lib/format";
import { trackingUrl } from "@/server/orders/tracking";

type Item = { id: string; name: string; variantLabel: string | null; imageUrl: string | null; quantity: number; unitPriceCents: number; type: string; product: { slug: string } | null };
type Order = {
  number: number;
  status: string;
  createdAt: Date;
  hasPhysical: boolean;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
  shippingName: string | null;
  shippingAddress: unknown;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  discountCode?: { code: string } | null;
  items: Item[];
};
type DownloadLink = { assetId: string; name: string; url: string };

export function DownloadList({ downloads }: { downloads: DownloadLink[] }) {
  if (!downloads.length) return null;
  return (
    <section aria-labelledby="downloads-heading" className="rounded-3xl bg-ember-soft p-5 sm:p-6">
      <h2 id="downloads-heading" className="font-display text-xl font-bold">
        Your downloads
      </h2>
      <ul className="mt-4 space-y-2">
        {downloads.map((d) => (
          <li key={d.assetId}>
            <a href={d.url} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 font-semibold shadow-sm transition hover:shadow-md" download>
              <span className="flex items-center gap-3">
                <FileText className="size-5 text-ember-strong" aria-hidden /> {d.name}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs text-white">
                <Download className="size-3.5" aria-hidden /> Download
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">Secure links expire after 72 hours. You can always get fresh ones from your account.</p>
    </section>
  );
}

export function OrderSummary({ order }: { order: Order }) {
  const addr = order.shippingAddress as { line1?: string; line2?: string | null; city?: string; state?: string; postal_code?: string; country?: string } | null;
  const track = order.trackingNumber ? trackingUrl(order.trackingCarrier, order.trackingNumber) : null;
  return (
    <div className="space-y-6">
      <ul className="divide-y rounded-3xl border bg-white px-5" aria-label="Items in this order">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-muted">{item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />}</div>
            <div className="min-w-0 flex-1">
              {item.product ? (
                <Link href={`/products/${item.product.slug}`} className="font-semibold hover:underline">
                  {item.name}
                </Link>
              ) : (
                <p className="font-semibold">{item.name}</p>
              )}
              <p className="text-sm text-muted-foreground">{[item.type === "DIGITAL" ? "Digital download" : item.variantLabel, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}</p>
            </div>
            <p className="font-semibold tabular-nums">{formatPriceExact(item.unitPriceCents * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <dl className="space-y-2 rounded-3xl border bg-white p-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPriceExact(order.subtotalCents)}</dd>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between text-success">
              <dt>Discount {order.discountCode ? `(${order.discountCode.code})` : ""}</dt>
              <dd className="tabular-nums">−{formatPriceExact(order.discountCents)}</dd>
            </div>
          )}
          {order.hasPhysical && (
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{order.shippingCents ? formatPriceExact(order.shippingCents) : "Free"}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="tabular-nums">{formatPriceExact(order.taxCents)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatPriceExact(order.totalCents)}</dd>
          </div>
        </dl>
        {order.hasPhysical && (
          <div className="rounded-3xl border bg-white p-5 text-sm">
            <h3 className="font-semibold">Shipping to</h3>
            {addr ? (
              <address className="mt-2 text-muted-foreground not-italic">
                {order.shippingName}
                <br />
                {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ""}
                <br />
                {addr.city}, {addr.state} {addr.postal_code}
                <br />
                {addr.country}
              </address>
            ) : (
              <p className="mt-2 text-muted-foreground">Address will appear once payment is confirmed.</p>
            )}
            {order.trackingNumber && (
              <p className="mt-4">
                <span className="font-semibold">Tracking:</span> {order.trackingCarrier}{" "}
                {track ? (
                  <a href={track} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-ember-strong underline-offset-4 hover:underline">
                    {order.trackingNumber} <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                ) : (
                  <span className="font-mono">{order.trackingNumber}</span>
                )}
              </p>
            )}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Ordered {formatDate(order.createdAt, { dateStyle: "long", timeStyle: "short" })}</p>
    </div>
  );
}
