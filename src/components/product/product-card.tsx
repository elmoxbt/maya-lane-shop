import Image from "next/image";
import Link from "next/link";
import { Download } from "lucide-react";
import type { ProductCardData } from "@/server/queries/products";
import { Price } from "./price";
import { Stars } from "./stars";
import { QuickAdd } from "./quick-add";
import { cn } from "@/lib/utils";

export function ProductCard({ product, priority, className }: { product: ProductCardData; priority?: boolean; className?: string }) {
  const [primary, secondary] = product.images;
  return (
    <article className={cn("group relative flex flex-col", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
        {primary && (
          <Image
            src={primary.url}
            alt={primary.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={cn("object-cover transition duration-500 group-hover:scale-[1.03]", secondary && "group-hover:opacity-0")}
          />
        )}
        {secondary && (
          <Image src={secondary.url} alt="" aria-hidden fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />
        )}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.badge && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase shadow-sm">{product.badge}</span>}
          {!product.inStock && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase">Sold out</span>}
        </div>
        {product.type === "DIGITAL" && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
            <Download className="size-3" aria-hidden /> Digital
          </span>
        )}
        {product.inStock && <QuickAdd product={product} />}
      </div>
      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5">
        <h3 className="text-sm leading-snug font-semibold sm:text-[15px]">
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        {product.rating != null && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Stars rating={product.rating} />
            <span>({product.reviewCount})</span>
          </div>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Price cents={product.priceCents} compareAt={product.compareAtCents} />
          {product.colors.length > 1 && (
            <span className="flex -space-x-1" aria-label={`${product.colors.length} colours`}>
              {product.colors.slice(0, 4).map((c) => (
                <span key={c.name} title={c.name} className="size-3.5 rounded-full border-2 border-background" style={{ backgroundColor: c.hex }} />
              ))}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products, priorityCount = 0, className }: { products: ProductCardData[]; priorityCount?: number; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4", className)}>
      {products.map((p, i) => (
        <li key={p.id} className="flex">
          <ProductCard product={p} priority={i < priorityCount} className="w-full" />
        </li>
      ))}
    </ul>
  );
}
