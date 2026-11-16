"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16 text-center" role="alert">
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">Something went sideways</h1>
        <p className="mt-3 text-muted-foreground">That&apos;s on us, not you. Try again, and if it keeps happening, email hello@mayalane.shop.</p>
        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={reset} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 font-semibold text-white">
            <RotateCcw className="size-4" aria-hidden /> Try again
          </button>
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border px-6 font-semibold">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
