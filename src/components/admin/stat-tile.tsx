import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatTile({ label, value, change, hint }: { label: string; value: string; change?: number | null; hint?: string }) {
  const up = (change ?? 0) >= 0;
  return (
    <div className="rounded-2xl border bg-white p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight tabular-nums">{value}</p>
      {change != null ? (
        <p className={cn("mt-1 inline-flex items-center gap-1 text-xs font-semibold", up ? "text-success" : "text-destructive")}>
          {up ? <ArrowUpRight className="size-3.5" aria-hidden /> : <ArrowDownRight className="size-3.5" aria-hidden />}
          {Math.abs(change).toFixed(1)}% <span className="font-normal text-muted-foreground">vs previous 30 days</span>
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
