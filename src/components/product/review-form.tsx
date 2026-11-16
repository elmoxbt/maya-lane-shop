"use client";

import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitReview } from "@/server/actions/reviews";
import { cn } from "@/lib/utils";

const schema = z.object({
  rating: z.number().int().min(1, "Choose a rating").max(5),
  title: z.string().trim().min(3, "Add a short title").max(80),
  body: z.string().trim().min(10, "Tell people a little more").max(1500),
});
type Values = z.infer<typeof schema>;

export function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(0);
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { rating: 0, title: "", body: "" } });
  const rating = useWatch({ control: form.control, name: "rating" });
  const { errors } = form.formState;

  if (!open) {
    return (
      <Button variant="outline" className="h-11 rounded-full px-6" onClick={() => setOpen(true)}>
        Write a review
      </Button>
    );
  }

  const onSubmit = form.handleSubmit((values) =>
    startTransition(async () => {
      const res = await submitReview({ ...values, productId });
      if (res.ok) {
        toast.success(res.message);
        form.reset();
        setOpen(false);
      } else toast.error(res.error);
    }),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-xl space-y-4 rounded-2xl border p-5">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">Your rating</legend>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
              <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => form.setValue("rating", n, { shouldValidate: true })} className="peer sr-only" />
              <span className="sr-only">
                {n} star{n > 1 ? "s" : ""}
              </span>
              <Star aria-hidden className={cn("size-8 rounded transition peer-focus-visible:ring-2 peer-focus-visible:ring-ember", (hover || rating) >= n ? "fill-ink text-ink" : "text-border")} />
            </label>
          ))}
        </div>
        {errors.rating && <p role="alert" className="mt-1 text-sm text-destructive">{errors.rating.message}</p>}
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor="review-title">Title</Label>
        <Input id="review-title" className="h-11" aria-invalid={Boolean(errors.title)} {...form.register("title")} />
        {errors.title && <p role="alert" className="text-sm text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="review-body">Review</Label>
        <Textarea id="review-body" rows={4} aria-invalid={Boolean(errors.body)} {...form.register("body")} />
        {errors.body && <p role="alert" className="text-sm text-destructive">{errors.body.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="h-11 rounded-full px-6">
          {pending && <Loader2 className="animate-spin" aria-hidden />} Post review
        </Button>
        <Button type="button" variant="ghost" className="h-11 rounded-full" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
