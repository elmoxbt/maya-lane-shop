"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { categoryLabels } from "@/config/site";
import { priceRanges } from "@/lib/shop-params";
import { useQueryParams } from "@/hooks/use-query-params";

const types = [
  { value: "", label: "Everything" },
  { value: "PHYSICAL", label: "Physical merch" },
  { value: "DIGITAL", label: "Digital downloads" },
];

export function ShopFilters({ onChange }: { onChange?: () => void }) {
  const { params, update } = useQueryParams();
  const selectedCats = params.getAll("category");
  const type = params.get("type") ?? "";
  const price = params.get("price") ?? "";
  const activeCount = selectedCats.length + (type ? 1 : 0) + (price ? 1 : 0);

  const toggleCat = (cat: string, checked: boolean) => {
    update({ category: checked ? [...selectedCats, cat] : selectedCats.filter((c) => c !== cat) });
    onChange?.();
  };

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">Category</legend>
        <div className="space-y-3">
          {Object.entries(categoryLabels).map(([value, label]) => (
            <div key={value} className="flex items-center gap-3">
              <Checkbox id={`cat-${value}`} checked={selectedCats.includes(value)} onCheckedChange={(c) => toggleCat(value, c === true)} className="size-5" />
              <Label htmlFor={`cat-${value}`} className="cursor-pointer text-[15px] font-normal">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">Type</legend>
        <RadioGroup
          value={type}
          onValueChange={(v) => {
            update({ type: v || null });
            onChange?.();
          }}
          className="gap-3"
        >
          {types.map((t) => (
            <div key={t.value || "all"} className="flex items-center gap-3">
              <RadioGroupItem value={t.value} id={`type-${t.value || "all"}`} className="size-5" />
              <Label htmlFor={`type-${t.value || "all"}`} className="cursor-pointer text-[15px] font-normal">
                {t.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-bold tracking-widest text-muted-foreground uppercase">Price</legend>
        <RadioGroup
          value={price}
          onValueChange={(v) => {
            update({ price: v || null });
            onChange?.();
          }}
          className="gap-3"
        >
          {[{ id: "", label: "Any price" }, ...priceRanges].map((r) => (
            <div key={r.id || "any"} className="flex items-center gap-3">
              <RadioGroupItem value={r.id} id={`price-${r.id || "any"}`} className="size-5" />
              <Label htmlFor={`price-${r.id || "any"}`} className="cursor-pointer text-[15px] font-normal">
                {r.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      {activeCount > 0 && (
        <button
          type="button"
          onClick={() => {
            update({ category: null, type: null, price: null });
            onChange?.();
          }}
          className="text-sm font-semibold underline underline-offset-4"
        >
          Clear filters ({activeCount})
        </button>
      )}
    </div>
  );
}
