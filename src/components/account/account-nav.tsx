"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/downloads", label: "Downloads" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="mt-6 flex gap-1 overflow-x-auto border-b">
      {links.map((l) => {
        const active = l.href === "/account" ? pathname === l.href : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn("-mb-px border-b-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition", active ? "border-ink text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
