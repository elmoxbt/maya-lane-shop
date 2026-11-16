import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";
import { Countdown } from "@/components/common/countdown";
import { giftGuide } from "@/config/gift-guide";
import { siteConfig } from "@/config/site";
import type { ProductCardData } from "@/server/queries/products";
import { formatPrice } from "@/lib/format";

export function GiftGuideTeaser({ products }: { products: ProductCardData[] }) {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return (
    <section aria-labelledby="gift-guide-heading" className="relative overflow-hidden bg-ink text-white">
      <div className="absolute -top-32 -right-32 size-96 rounded-full bg-ember/30 blur-3xl" aria-hidden />
      <div className="container-page relative py-16 sm:py-24">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_1.4fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-[0.18em] text-ember uppercase">
              <Gift className="size-3.5" aria-hidden /> {giftGuide.eyebrow}
            </p>
            <h2 id="gift-guide-heading" className="mt-4 font-display text-4xl leading-[1] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {giftGuide.title}
            </h2>
            <p className="mt-4 max-w-md text-white/75">{giftGuide.intro}</p>
          </div>
          <div className="lg:justify-self-end">
            <p className="mb-3 text-sm font-semibold text-white/80">Order by Dec 17 for guaranteed holiday delivery</p>
            <Countdown target={siteConfig.holidayCutoff} />
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {giftGuide.bundles.map((b) => {
            const items = b.productSlugs.map((s) => bySlug.get(s)).filter(Boolean) as ProductCardData[];
            const total = items.reduce((s, p) => s + p.priceCents, 0);
            return (
              <li key={b.id}>
                <Link href={`/gift-guide#${b.id}`} className="group flex h-full flex-col rounded-3xl bg-white/[0.06] p-4 ring-1 ring-white/10 transition hover:bg-white/10">
                  <div className="grid grid-cols-3 gap-2">
                    {items.map((p) => (
                      <div key={p.id} className="relative aspect-square overflow-hidden rounded-2xl bg-white/10">
                        {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="(min-width: 768px) 10vw, 30vw" className="object-cover transition duration-500 group-hover:scale-105" />}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs font-semibold text-ember">{b.forWho}</p>
                  <h3 className="mt-1 font-display text-xl font-bold">{b.title}</h3>
                  <div className="mt-auto flex items-center justify-between pt-4 text-sm">
                    <span>
                      {formatPrice(Math.round(total * 0.85))} <span className="text-white/50 line-through">{formatPrice(total)}</span>
                    </span>
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-10 text-center">
          <Link href="/gift-guide" className="inline-flex h-12 items-center gap-2 rounded-full bg-ember px-7 font-semibold text-ink transition hover:brightness-95">
            Explore the full gift guide <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
