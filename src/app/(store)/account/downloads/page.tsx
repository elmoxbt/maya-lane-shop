import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileDown } from "lucide-react";
import { requireUser } from "@/server/auth-guards";
import { getUserDownloads } from "@/server/queries/orders";
import { formatDate, orderNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Downloads", robots: { index: false } };

export default async function DownloadsPage() {
  const user = await requireUser("/account/downloads");
  const downloads = await getUserDownloads(user.id);

  if (!downloads.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed px-6 py-16 text-center">
        <FileDown className="size-8 text-muted-foreground" aria-hidden />
        <p className="mt-3 font-display text-xl font-bold">No downloads yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">Programs, ebooks and presets you buy live here forever. Grab a fresh link any time.</p>
        <Link href="/shop?type=DIGITAL" className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-semibold text-white">
          Browse digital products
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-3xl border bg-white">
      {downloads.map((d) => (
        <li key={d.assetId} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">{d.productName}</p>
            <p className="text-sm text-muted-foreground">
              {d.name} · Purchased {formatDate(d.purchasedAt)} · {orderNumber(d.orderNumber)}
            </p>
          </div>
          <a href={d.url} download className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink/85">
            <Download className="size-4" aria-hidden /> Download
          </a>
        </li>
      ))}
    </ul>
  );
}
