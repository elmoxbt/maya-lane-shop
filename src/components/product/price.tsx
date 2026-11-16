import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({ cents, compareAt, className, size = "md" }: { cents: number; compareAt?: number | null; className?: string; size?: "md" | "lg" }) {
  const onSale = compareAt != null && compareAt > cents;
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-semibold tabular-nums", size === "lg" ? "text-2xl" : "text-sm", onSale && "text-ember-strong")}>
        {onSale && <span className="sr-only">Sale price </span>}
        {formatPrice(cents)}
      </span>
      {onSale && (
        <span className={cn("text-muted-foreground tabular-nums line-through", size === "lg" ? "text-base" : "text-xs")}>
          <span className="sr-only">Original price </span>
          {formatPrice(compareAt)}
        </span>
      )}
    </span>
  );
}
