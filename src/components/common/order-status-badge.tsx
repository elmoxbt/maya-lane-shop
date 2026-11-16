import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PAID: "bg-blue-50 text-blue-800",
  SHIPPED: "bg-amber-50 text-amber-800",
  DELIVERED: "bg-emerald-50 text-emerald-800",
  REFUNDED: "bg-rose-50 text-rose-800",
  CANCELLED: "bg-muted text-muted-foreground",
};

const labels: Record<string, string> = { PENDING: "Pending", PAID: "Paid", SHIPPED: "Shipped", DELIVERED: "Delivered", REFUNDED: "Refunded", CANCELLED: "Cancelled" };

export function OrderStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", styles[status], className)}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {labels[status] ?? status}
    </span>
  );
}
