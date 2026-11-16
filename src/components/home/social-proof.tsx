import { Heart, MessageCircle, Play } from "lucide-react";
import { siteConfig } from "@/config/site";
import { testimonials } from "@/config/testimonials";

const stats = [
  { value: siteConfig.social.tiktok.followers, label: "TikTok followers" },
  { value: "42.6M", label: "likes on Sunday resets" },
  { value: "18.4K", label: "orders shipped" },
  { value: "4.9★", label: "average review" },
];

export function SocialProof() {
  return (
    <section aria-labelledby="proof-heading" className="bg-paper py-16 sm:py-24">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold tracking-[0.18em] text-ember-strong uppercase">The Lane Club</p>
          <h2 id="proof-heading" className="mt-2 font-display text-3xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-5xl">
            850K people already hit follow. Here&apos;s what they say.
          </h2>
        </div>

        <dl className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-white p-5 text-center shadow-sm">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{s.value}</span>
                <span className="mt-1 block text-xs text-muted-foreground sm:text-sm" aria-hidden>
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <ul className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:grid sm:grid-cols-3 sm:overflow-visible" aria-label="Customer testimonials">
          {testimonials.map((t) => (
            <li key={t.handle} className="w-[78%] shrink-0 snap-center sm:w-auto">
              <figure className="relative flex aspect-[9/14] flex-col justify-end overflow-hidden rounded-3xl bg-ink p-5 text-white" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,.85) 30%, rgba(0,0,0,.1)), url(${t.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
                <span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold backdrop-blur" aria-hidden>
                  <Play className="size-3 fill-current" /> {t.views}
                </span>
                <div className="absolute right-3 bottom-28 flex flex-col items-center gap-4 text-xs font-semibold" aria-hidden>
                  <span className="flex flex-col items-center gap-1">
                    <Heart className="size-7 fill-white" /> {t.likes}
                  </span>
                  <span className="flex flex-col items-center gap-1">
                    <MessageCircle className="size-7 fill-white" /> {t.comments}
                  </span>
                </div>
                <blockquote className="pr-12 text-lg leading-snug font-semibold">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="mt-3 text-sm text-white/75">
                  <span className="font-semibold text-white">{t.handle}</span> · {t.name}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
