import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";
import { requireAdminPage } from "@/server/auth-guards";
import { db } from "@/lib/db";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { DemoBanner } from "@/components/layout/demo-banner";
import { signOutAction } from "@/server/actions/auth";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s · Admin · Maya Lane" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdminPage();
  const [newInquiries, toShip] = await Promise.all([db.brandInquiry.count({ where: { status: "NEW" } }), db.order.count({ where: { status: "PAID", hasPhysical: true } })]);
  const badges = { "/admin/inquiries": newInquiries, "/admin/orders": toShip };

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <DemoBanner />
      {admin.role === "DEMO_ADMIN" && (
        <div className="flex items-center justify-center gap-2 bg-ember px-4 py-2 text-center text-sm font-semibold text-ink">
          <Eye className="size-4" aria-hidden /> Read-only demo admin. Explore freely; changes are disabled.
        </div>
      )}
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r bg-white p-4 lg:flex">
          <Link href="/admin" className="px-3 py-2 font-display text-lg font-extrabold">
            MAYA LANE<span className="text-ember">.</span> <span className="text-sm font-semibold text-muted-foreground">Admin</span>
          </Link>
          <div className="mt-6">
            <AdminNav badges={badges} />
          </div>
          <div className="mt-auto space-y-1 border-t pt-4 text-sm">
            <Link href="/" className="flex items-center gap-2 rounded-xl px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <ExternalLink className="size-4" aria-hidden /> View store
            </Link>
            <p className="truncate px-3 pt-2 text-xs text-muted-foreground">{admin.email}</p>
            <form action={signOutAction}>
              <button type="submit" className="w-full rounded-xl px-3 py-2 text-left text-muted-foreground hover:bg-muted hover:text-foreground">
                Sign out
              </button>
            </form>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-white/90 px-4 backdrop-blur lg:hidden">
            <AdminMobileNav badges={badges} />
            <span className="font-display font-extrabold">
              MAYA LANE<span className="text-ember">.</span> Admin
            </span>
            <Link href="/" className="ml-auto text-sm font-semibold text-muted-foreground">
              View store
            </Link>
          </header>
          <main id="main" className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
