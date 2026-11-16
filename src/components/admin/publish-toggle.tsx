"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { setProductPublished } from "@/server/actions/admin/products";

export function PublishToggle({ id, published, name }: { id: string; published: boolean; name: string }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(published);
  return (
    <Switch
      checked={optimistic}
      disabled={pending}
      aria-label={`${name} is ${optimistic ? "published" : "hidden"}`}
      onCheckedChange={(next) =>
        start(async () => {
          setOptimistic(next);
          const res = await setProductPublished({ id, published: next });
          if (res.ok) toast.success(res.message);
          else toast.error(res.error);
        })
      }
    />
  );
}
