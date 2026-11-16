import Link from "next/link";
import { BadgeCheck, MessageSquareText } from "lucide-react";
import { Stars } from "./stars";
import { ReviewForm } from "./review-form";
import { formatDate, pluralize } from "@/lib/format";
import type { getProductReviews } from "@/server/queries/products";

type Data = Awaited<ReturnType<typeof getProductReviews>>;

export function ReviewsSection({ productId, slug, data, signedIn }: { productId: string; slug: string; data: Data; signedIn: boolean }) {
  return (
    <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-24 border-t py-14 sm:py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <h2 id="reviews-heading" className="font-display text-3xl font-extrabold tracking-tight">
            Reviews
          </h2>
          {data.average != null ? (
            <>
              <div className="mt-4 flex items-end gap-3">
                <span className="font-display text-6xl leading-none font-extrabold">{data.average.toFixed(1)}</span>
                <div className="pb-1">
                  <Stars rating={data.average} size="md" />
                  <p className="mt-1 text-sm text-muted-foreground">{pluralize(data.count, "review")}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-2" aria-label="Rating breakdown">
                {data.distribution.map((d) => (
                  <li key={d.star} className="flex items-center gap-3 text-sm">
                    <span className="w-10 tabular-nums">{d.star} star</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                      <span className="block h-full rounded-full bg-ink" style={{ width: `${data.count ? (d.count / data.count) * 100 : 0}%` }} />
                    </span>
                    <span className="w-6 text-right text-muted-foreground tabular-nums">{d.count}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mt-3 text-muted-foreground">No reviews yet. Be the first to share what you think!</p>
          )}
          <div className="mt-6">
            {signedIn ? (
              <ReviewForm productId={productId} />
            ) : (
              <Link href={`/login?callbackUrl=${encodeURIComponent(`/products/${slug}#reviews`)}`} className="inline-flex h-11 items-center rounded-full border px-6 text-sm font-semibold transition hover:border-ink">
                Sign in to write a review
              </Link>
            )}
          </div>
        </div>
        {data.reviews.length > 0 ? (
          <ul className="divide-y">
            {data.reviews.map((r) => (
              <li key={r.id} className="py-6 first:pt-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Stars rating={r.rating} />
                  <h3 className="font-semibold">{r.title}</h3>
                </div>
                <p className="mt-2 text-pretty text-foreground/85">{r.body}</p>
                <p className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{r.authorName}</span>
                  {r.verified && (
                    <span className="inline-flex items-center gap-1 text-success">
                      <BadgeCheck className="size-4" aria-hidden /> Verified buyer
                    </span>
                  )}
                  <span aria-hidden>·</span>
                  <time dateTime={r.createdAt.toISOString()}>{formatDate(r.createdAt)}</time>
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed p-10 text-center">
            <MessageSquareText className="size-8 text-muted-foreground" aria-hidden />
            <p className="mt-3 font-semibold">Reviews will show up here</p>
          </div>
        )}
      </div>
    </section>
  );
}
