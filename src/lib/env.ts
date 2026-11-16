import "server-only";

/** Feature flags derived from which integrations are configured. Lets the demo run with partial setup. */
export const integrations = {
  stripe: Boolean(process.env.STRIPE_SECRET_KEY),
  stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
  resend: Boolean(process.env.RESEND_API_KEY),
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  cloudinary: Boolean(
    process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET,
  ),
};

export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
