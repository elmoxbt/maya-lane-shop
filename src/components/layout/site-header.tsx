import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { Logo } from "./logo";
import { navLinks } from "./nav-links";
import { MobileNav } from "./mobile-nav";
import { CartButton } from "@/components/cart/cart-button";
import { HeaderNavLink } from "./header-nav-link";

export function SiteHeader({ signedIn, isAdmin }: { signedIn: boolean; isAdmin: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container-page flex h-16 items-center gap-2">
        <MobileNav signedIn={signedIn} isAdmin={isAdmin} />
        <Logo className="mr-auto md:mr-8" />
        <nav aria-label="Main" className="mr-auto hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <HeaderNavLink key={l.href} href={l.href} highlight={"highlight" in l && l.highlight}>
              {l.label}
            </HeaderNavLink>
          ))}
        </nav>
        <div className="flex items-center gap-0.5">
          <Link href="/shop?focus=search" className="grid size-11 place-items-center rounded-full transition hover:bg-muted" aria-label="Search products">
            <Search className="size-5" aria-hidden />
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hidden rounded-full bg-muted px-3 py-1.5 text-xs font-semibold transition hover:bg-accent sm:inline-flex">
              Dashboard
            </Link>
          )}
          <Link
            href={signedIn ? "/account" : "/login"}
            className="hidden size-11 place-items-center rounded-full transition hover:bg-muted sm:grid"
            aria-label={signedIn ? "Your account" : "Sign in"}
          >
            <UserRound className="size-5" aria-hidden />
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
