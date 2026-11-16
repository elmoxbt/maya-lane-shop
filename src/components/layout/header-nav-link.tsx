"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function HeaderNavLink({ href, highlight, children }: { href: string; highlight?: boolean; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative rounded-full px-3.5 py-2 text-sm font-medium transition hover:bg-muted",
        active && "bg-muted",
      )}
    >
      {children}
      {highlight && <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-ember" aria-hidden />}
    </Link>
  );
}
