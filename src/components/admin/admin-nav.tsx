"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BadgePercent, Handshake, LayoutDashboard, Package, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/discounts", label: "Discounts", icon: BadgePercent },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inquiries", label: "Brand inquiries", icon: Handshake },
];

export function AdminNav({ onNavigate, badges }: { onNavigate?: () => void; badges?: Partial<Record<string, number>> }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {adminLinks.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
        const badge = badges?.[href];
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active ? "bg-ink text-white" : "text-foreground/75 hover:bg-muted hover:text-foreground")}
          >
            <Icon className="size-4" aria-hidden />
            <span className="flex-1">{label}</span>
            {badge ? <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", active ? "bg-ember text-ink" : "bg-ember-soft text-ember-strong")}>{badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
