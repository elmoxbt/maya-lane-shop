import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({ eyebrow, title, description, href, linkLabel = "View all", className, align = "left" }: { eyebrow?: string; title: string; description?: string; href?: string; linkLabel?: string; className?: string; align?: "left" | "center" }) {
  return (
    <div className={cn("mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between", align === "center" && "items-center text-center sm:flex-col sm:items-center", className)}>
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className="mb-2 text-xs font-bold tracking-[0.18em] text-ember-strong uppercase">{eyebrow}</p>}
        <h2 className="font-display text-3xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">{title}</h2>
        {description && <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline">
          {linkLabel} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      )}
    </div>
  );
}
