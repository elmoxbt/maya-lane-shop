"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateInquiryStatus } from "@/server/actions/admin/marketing";

const labels = { NEW: "New", IN_PROGRESS: "In progress", CLOSED: "Closed" } as const;

export function InquiryStatusSelect({ id, status }: { id: string; status: keyof typeof labels }) {
  const router = useRouter();
  const [value, setValue] = useState<string>(status);
  const [pending, start] = useTransition();
  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={(v) => {
        setValue(v);
        start(async () => {
          const res = await updateInquiryStatus({ id, status: v });
          if (res.ok) {
            toast.success(res.message);
            router.refresh();
          } else {
            toast.error(res.error);
            setValue(status);
          }
        });
      }}
    >
      <SelectTrigger className="h-9! w-36" aria-label="Inquiry status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(labels).map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
