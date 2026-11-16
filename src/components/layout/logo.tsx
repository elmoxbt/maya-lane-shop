import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("font-display text-xl font-extrabold tracking-tight whitespace-nowrap", inverted ? "text-white" : "text-ink", className)} aria-label="Maya Lane Shop, home">
      MAYA LANE<span className="text-ember">.</span>
    </Link>
  );
}
