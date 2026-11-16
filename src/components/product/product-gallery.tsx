"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: { id: string; url: string; alt: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);

  function go(i: number) {
    const next = (i + images.length) % images.length;
    setActive(next);
    const el = scroller.current;
    if (el) el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
  }

  if (!images.length) return <div className="aspect-[4/5] rounded-3xl bg-muted" aria-label={`No images for ${name}`} />;

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse" role="region" aria-roledescription="carousel" aria-label={`${name} images`}>
      <div className="relative flex-1">
        <div
          ref={scroller}
          className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto rounded-3xl bg-muted [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={(e) => {
            const el = e.currentTarget;
            const i = Math.round(el.scrollLeft / el.clientWidth);
            if (i !== active) setActive(i);
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
            e.preventDefault();
            go(active + (e.key === "ArrowRight" ? 1 : -1));
          }}
          aria-label="Use left and right arrow keys to browse images"
        >
          {images.map((img, i) => (
            <div key={img.id} className="relative h-full w-full shrink-0 snap-center" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${images.length}`}>
              <Image src={img.url} alt={img.alt} fill priority={i === 0} sizes="(min-width: 1024px) 50vw, 100vw" quality={85} className="object-cover" />
            </div>
          ))}
        </div>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5 lg:hidden" aria-hidden>
            {images.map((img, i) => (
              <span key={img.id} className={cn("h-1.5 rounded-full bg-white/70 transition-all", i === active ? "w-5 bg-white" : "w-1.5")} />
            ))}
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="hidden gap-3 lg:flex lg:w-20 lg:flex-col">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={cn("relative aspect-square w-full overflow-hidden rounded-xl bg-muted ring-2 ring-offset-2 transition", i === active ? "ring-ink" : "ring-transparent hover:ring-border")}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
