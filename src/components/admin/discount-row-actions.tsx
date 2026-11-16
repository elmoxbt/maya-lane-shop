"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteDiscount, toggleDiscount } from "@/server/actions/admin/marketing";

export function DiscountRowActions({ id, code, active }: { id: string; code: string; active: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; message?: string; error?: string }>) =>
    start(async () => {
      const res = await fn();
      if (res.ok) {
        toast.success(res.message);
        router.refresh();
      } else toast.error(res.error);
    });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="grid size-8 place-items-center rounded-full hover:bg-muted" aria-label={`Actions for ${code}`} disabled={pending}>
        <MoreHorizontal className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => run(() => toggleDiscount({ id, active: !active }))}>{active ? "Pause code" : "Activate code"}</DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => {
            if (confirm(`Delete ${code}? Orders that used it keep their discount.`)) run(() => deleteDiscount({ id }));
          }}
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
