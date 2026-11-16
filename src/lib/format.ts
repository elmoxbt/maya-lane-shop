const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdRound = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Format integer cents as USD. Whole-dollar amounts drop the decimals ($68 not $68.00). */
export function formatPrice(cents: number) {
  return cents % 100 === 0 ? usdRound.format(cents / 100) : usd.format(cents / 100);
}

export function formatPriceExact(cents: number) {
  return usd.format(cents / 100);
}

export function orderNumber(n: number) {
  return `ML-${1000 + n}`;
}

export function formatDate(date: Date | string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  return new Intl.DateTimeFormat("en-US", opts).format(new Date(date));
}

export function variantLabel(v: { size?: string | null; color?: string | null }) {
  return [v.color, v.size].filter(Boolean).join(" / ") || null;
}

export function pluralize(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}

export function absoluteUrl(path = "/") {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}
