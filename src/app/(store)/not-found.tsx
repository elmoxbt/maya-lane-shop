import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center">
      <div className="max-w-md">
        <p className="font-display text-8xl font-extrabold tracking-tight text-ember">404</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">This page skipped leg day</h1>
        <p className="mt-3 text-muted-foreground">We couldn&apos;t find what you were looking for. It might have sold out, moved, or never existed.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/shop" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-white">
            Shop bestsellers <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border px-6 font-semibold">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
