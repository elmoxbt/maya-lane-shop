"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AdminNav } from "./admin-nav";

export function AdminMobileNav({ badges }: { badges?: Partial<Record<string, number>> }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="grid size-10 place-items-center rounded-full hover:bg-muted lg:hidden" aria-label="Open admin menu">
        <Menu className="size-5" aria-hidden />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4">
        <SheetHeader className="px-1">
          <SheetTitle className="font-display text-lg font-extrabold">
            MAYA LANE<span className="text-ember">.</span> Admin
          </SheetTitle>
          <SheetDescription className="sr-only">Admin navigation</SheetDescription>
        </SheetHeader>
        <AdminNav onNavigate={() => setOpen(false)} badges={badges} />
      </SheetContent>
    </Sheet>
  );
}
