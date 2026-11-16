import { auth } from "@/auth";
import { DemoBanner } from "@/components/layout/demo-banner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartSync } from "@/components/cart/cart-sync";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const session = await auth();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN" || user?.role === "DEMO_ADMIN";
  return (
    <>
      <a href="#main" className="sr-only z-50 rounded-full bg-ink px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <DemoBanner />
      <SiteHeader signedIn={Boolean(user)} isAdmin={isAdmin} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <CartSync userId={user?.id ?? null} />
    </>
  );
}
