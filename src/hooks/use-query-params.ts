"use client";

import { useCallback, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Small helper to update URL search params (shallow-merge) without losing the others. */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const update = useCallback(
    (changes: Record<string, string | string[] | null>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(changes)) {
        next.delete(key);
        if (value == null || value === "") continue;
        if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
        else next.set(key, value);
      }
      next.delete("focus");
      startTransition(() => router.replace(next.size ? `${pathname}?${next}` : pathname, { scroll: false }));
    },
    [params, pathname, router],
  );

  return { params, update, pending };
}
