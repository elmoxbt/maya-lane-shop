"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { siteConfig } from "@/config/site";

const CARD = "4242 4242 4242 4242";

export function DemoBanner() {
  const [copied, setCopied] = useState(false);
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(CARD.replaceAll(" ", ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div role="region" aria-label="Demo store notice" className="bg-ink text-[13px] leading-snug text-white">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-2 text-center">
        <span>
          This is a demo store built by <strong className="font-semibold text-ember">{siteConfig.builtBy}</strong>. Use card
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[12px] tracking-wide transition hover:bg-white/20"
          aria-label={copied ? "Card number copied" : `Copy test card number ${CARD}`}
        >
          {CARD}
          {copied ? <Check className="size-3.5 text-ember" aria-hidden /> : <Copy className="size-3.5 opacity-70" aria-hidden />}
        </button>
        <span>to test checkout.</span>
      </div>
    </div>
  );
}
