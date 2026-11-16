import { requireUser } from "@/server/auth-guards";
import { AccountNav } from "@/components/account/account-nav";
import { signOutAction } from "@/server/actions/auth";
import { LogOut } from "lucide-react";

export default async function AccountLayout({ children }: LayoutProps<"/account">) {
  const user = await requireUser("/account");
  return (
    <div className="container-page py-8 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <h1 className="font-display text-4xl font-extrabold tracking-tight">Hey {user.name?.split(" ")[0] ?? "there"} 👋</h1>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
        </form>
      </div>
      <AccountNav />
      <div className="mt-8">{children}</div>
    </div>
  );
}
