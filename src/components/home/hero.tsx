import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Play } from "lucide-react";
import { Stars } from "@/components/product/stars";
import { siteConfig } from "@/config/site";

const heroImage = "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?auto=format&fit=crop&w=1400&q=80";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid grid-cols-1 items-center gap-10 pt-8 pb-14 sm:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16 lg:pb-24">
        <div className="relative z-10">
          <a
            href={siteConfig.social.tiktok.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border bg-white py-1.5 pr-3.5 pl-1.5 text-sm font-medium shadow-sm transition hover:border-ink"
          >
            <span className="grid size-6 place-items-center rounded-full bg-ink text-white">
              <Play className="size-3 fill-current" aria-hidden />
            </span>
            {siteConfig.social.tiktok.followers} on TikTok · {siteConfig.social.tiktok.handle}
          </a>
          <h1 className="mt-6 font-display text-[2.9rem] leading-[0.95] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
            Strong, soft <span className="relative whitespace-nowrap">
              <span className="relative z-10">&amp; a little</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-ember sm:bottom-2 sm:h-4" aria-hidden />
            </span>{" "}
            bit extra.
          </h1>
          <p className="mt-6 max-w-lg text-lg text-pretty text-muted-foreground sm:text-xl">
            Hi, I&apos;m Maya. This is everything I actually use: the hoodie from every Sunday reset, the bottle that lives on my desk, and the programs
            that got me lifting.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-semibold text-white transition hover:bg-ink/85">
              Shop the drop <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="#free-plan" className="inline-flex h-13 items-center justify-center rounded-full border border-ink/15 bg-white px-7 text-base font-semibold transition hover:border-ink">
              Get the free 7-day plan
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="flex -space-x-2" aria-hidden>
              {["1544005313-94ddf0286df2", "1534528741775-53994a69daeb", "1438761681033-6461ffad8d80", "1517841905240-472988babdf9"].map((id) => (
                <Image key={id} src={`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=80&h=80&q=70`} alt="" width={36} height={36} className="size-9 rounded-full border-2 border-background object-cover" />
              ))}
            </div>
            <div>
              <Stars rating={4.9} size="md" />
              <p className="text-muted-foreground">
                <strong className="text-foreground">4.9/5</strong> from 18,400+ happy customers
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-4 -z-10 rotate-3 rounded-[2.5rem] bg-ember/90 sm:-inset-6" aria-hidden />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-muted shadow-2xl">
            <Image src={heroImage} alt="Maya Lane sitting on her yoga mat after a morning flow" fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
            <p className="absolute top-5 left-5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-semibold shadow">Hi, I&apos;m Maya 👋</p>
          </div>
          <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl bg-white p-3 pr-4 shadow-xl sm:-left-8" aria-hidden>
            <span className="grid size-10 place-items-center rounded-full bg-ember-soft">
              <Heart className="size-5 fill-ember text-ember" />
            </span>
            <div className="text-sm leading-tight">
              <p className="font-bold">42.6M likes</p>
              <p className="text-muted-foreground">on Sunday reset videos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
