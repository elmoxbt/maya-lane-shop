"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    done: ms === 0,
    days: Math.floor(ms / 86400000),
    hours: Math.floor((ms / 3600000) % 24),
    minutes: Math.floor((ms / 60000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ target, tone = "dark", className, doneLabel = "Holiday shipping has closed. Digital gifts still arrive instantly!" }: { target: string; tone?: "dark" | "light"; className?: string; doneLabel?: string }) {
  const t = new Date(target).getTime();
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    // Computed client-side only (avoids hydration mismatch); first tick runs immediately.
    const tick = () => setLeft(diff(t));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [t]);

  if (left?.done) return <p className={cn("text-sm font-semibold", className)}>{doneLabel}</p>;

  const units = [
    ["days", left?.days],
    ["hrs", left?.hours],
    ["min", left?.minutes],
    ["sec", left?.seconds],
  ] as const;

  return (
    <div className={cn("flex gap-2", className)} role="timer" aria-label={left ? `${left.days} days, ${left.hours} hours and ${left.minutes} minutes left` : "Countdown loading"}>
      {units.map(([label, value]) => (
        <div key={label} className={cn("min-w-[3.75rem] rounded-xl px-2 py-2 text-center", tone === "dark" ? "bg-white/10 text-white" : "bg-white text-ink shadow-sm")} aria-hidden>
          <div className="font-display text-2xl font-extrabold tabular-nums sm:text-3xl">{value == null ? "--" : String(value).padStart(2, "0")}</div>
          <div className={cn("text-[10px] font-semibold tracking-widest uppercase", tone === "dark" ? "text-white/60" : "text-muted-foreground")}>{label}</div>
        </div>
      ))}
    </div>
  );
}
