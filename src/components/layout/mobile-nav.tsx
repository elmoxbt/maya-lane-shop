"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ArrowRight } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { navLinks } from "./nav-links";
import { siteConfig } from "@/config/site";

export function MobileNav({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const links = [
    ...navLinks,
    { href: signedIn ? "/account" : "/login", label: signedIn ? "My account" : "Sign in" },
    ...(isAdmin ? [{ href: "/admin", label: "Dashboard" }] : []),
  ];
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="-ml-2 grid size-11 place-items-center rounded-full transition hover:bg-muted md:hidden" aria-label="Open menu">
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] max-w-sm gap-0 p-0">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="font-display text-xl font-extrabold">
            MAYA LANE<span className="text-ember">.</span>
          </SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col p-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-4 font-display text-2xl font-bold tracking-tight transition hover:bg-muted"
            >
              {l.label}
              <ArrowRight className="size-5 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t p-5 text-sm text-muted-foreground">
          <p>
            Follow along on TikTok{" "}
            <a href={siteConfig.social.tiktok.url} className="font-semibold text-foreground underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
              {siteConfig.social.tiktok.handle}
            </a>
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
