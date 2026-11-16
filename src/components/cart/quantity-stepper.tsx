"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  max,
  onChange,
  label,
  size = "sm",
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "lg";
}) {
  const btn = cn("grid place-items-center rounded-full transition hover:bg-muted disabled:opacity-40 disabled:hover:bg-transparent", size === "lg" ? "size-11" : "size-8");
  return (
    <div className={cn("inline-flex items-center rounded-full border border-input", size === "lg" ? "h-12 px-0.5" : "h-9 px-0.5")} role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className={cn("text-center font-semibold tabular-nums", size === "lg" ? "w-8 text-base" : "w-6 text-sm")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}
