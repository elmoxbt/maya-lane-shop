import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (key.startsWith("sk_live") && process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    throw new Error("Refusing to use a live Stripe key while demo mode is on.");
  }
  client ??= new Stripe(key, { appInfo: { name: "Maya Lane Shop" }, maxNetworkRetries: 2 });
  return client;
}

export type { Stripe };
