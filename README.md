# Maya Lane Shop

A full-stack creator storefront demo for **Maya Lane**, a fictional lifestyle and fitness creator with 850K TikTok followers. It sells physical merch (hoodies, tees, bottles, bags) and digital products (training programs, a meal-prep ebook, Lightroom presets), with a complete admin dashboard.

> Demo store built by **Bazi**. Use card `4242 4242 4242 4242` to test checkout.

## Highlights

- **Storefront:** home page with hero, featured drops, holiday gift guide teaser with a live countdown, bestsellers, TikTok-style social proof, and a lead magnet that emails a real free PDF
- **Shop:** search, category / type / price filters, sorting, URL-driven state, skeleton loading and empty states
- **Product pages:** swipeable gallery, colour and size variants with per-variant stock, reviews with verified-buyer badges, related products, Product + Breadcrumb JSON-LD and per-product Open Graph images
- **Cart:** slide-out drawer, free-shipping progress, live discount codes. Guests keep their cart in localStorage; signed-in carts sync to the database and merge on sign-in
- **Checkout:** Stripe Checkout with shipping address collection (physical items only), standard/express rates, discount codes passed through as one-off coupons, and a Stripe Tax toggle
- **Fulfilment:** a signature-verified, idempotent webhook marks orders paid, decrements stock, counts discount usage, clears the cart and sends a React Email confirmation. The success page verifies with Stripe directly if the webhook is slow
- **Digital delivery:** HMAC-signed download links bound to the order and file, expiring after 72 hours, shown on the confirmation page, in the email and in the account. Refunds revoke access
- **Accounts:** magic-link email or Google sign-in, order history, status timeline, tracking links, re-downloads
- **Gift guide:** seasonal banner, shipping-cutoff countdown, one-tap "add the whole bundle" with an auto-applied bundle code
- **About and Media Kit:** audience stats, past partners, case studies, packages and a brand inquiry form
- **Admin (`/admin`):** revenue/orders/AOV/subscriber KPIs, 30-day revenue chart, top products, low stock alerts; product CRUD with variants, stock, images and digital file uploads; order management with status changes, Stripe refunds and tracking numbers that trigger a shipping email; discount codes; customers and subscribers with CSV export; brand inquiries
- **Security:** RBAC checked against the database on every admin page and action, Zod validation on every input, Postgres-backed rate limiting on forms, auth, checkout and discount checks, honeypots, CSV formula-injection protection, and a read-only demo admin

## Tech stack

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS v4 · shadcn/ui · PostgreSQL + Prisma 7 · Auth.js v5 · Stripe Checkout · Resend + React Email · Cloudinary · Zod · React Hook Form · Zustand · Recharts

## Quick start (about 5 minutes)

**Prerequisites:** Node.js 20.9+ (tested on Node 24) and npm.

```bash
npm install
cp .env.example .env
```

Generate an auth secret and paste it into `AUTH_SECRET` (and optionally `DOWNLOAD_TOKEN_SECRET`):

```bash
npx auth secret
```

### Database

Pick one:

- **Neon or Supabase (recommended):** create a project and set `DATABASE_URL` to the **pooled** connection string and `DIRECT_URL` to the direct one.
- **Zero-install local Postgres:** keep this running in its own terminal. It uses PGlite (Postgres compiled to WebAssembly), so there's no Docker. The default `DATABASE_URL` in `.env.example` already points at it.

```bash
npm run db:local
```

Then create the tables and seed the demo store:

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

The seed creates 12 products (8 physical, 4 digital) with variants and stock, Unsplash images, 51 reviews, 96 orders spread over the last 45 days, 5 discount codes, 64 subscribers, 4 brand inquiries, and these users:

| User | Email | Role |
| --- | --- | --- |
| Maya (admin) | value of `ADMIN_EMAIL` (default `admin@mayalane.shop`) | `ADMIN` |
| Demo admin | `demo-admin@mayalane.shop` | `DEMO_ADMIN` (read-only) |
| Demo customer | `demo@mayalane.shop` | `CUSTOMER`, with orders and downloads |

It also generates the real downloadable files (PDF programs, ebook, presets ZIP) into `storage/digital/` and the free lead-magnet PDF into `public/downloads/`.

### Run it

```bash
npm run dev
```

Open http://localhost:3000.

- **Sign in as admin:** go to `/login`, enter your `ADMIN_EMAIL`. Without `RESEND_API_KEY`, the magic link is printed in the terminal running `npm run dev`. Open it and you land in `/admin`.
- **Demo shortcuts:** with `NEXT_PUBLIC_DEMO_MODE="true"`, the login page has one-click **Demo customer** and **Demo admin** (read-only) buttons.

## Stripe test mode

1. Copy your **test** secret key from https://dashboard.stripe.com/test/apikeys into `STRIPE_SECRET_KEY`.
2. Install the [Stripe CLI](https://docs.stripe.com/stripe-cli), log in, and forward webhooks to your local server:

   ```bash
   stripe login
   ```

   ```bash
   npm run stripe:listen
   ```

3. Copy the `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET` and restart `npm run dev`.

The webhook listens at `/api/webhooks/stripe` and handles `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired` and `charge.refunded`.

> Even without the CLI running, test purchases complete: the confirmation page verifies the session with Stripe and runs the same idempotent fulfilment.

You can check the webhook's signature verification and idempotency without a Stripe account. This signs realistic events, replays them concurrently against the real route handler, asserts the results and cleans up:

```bash
npm run test:webhook
```

### Test cards

Use any future expiry date, any 3-digit CVC and any postcode.

| Scenario | Card number |
| --- | --- |
| Successful payment | `4242 4242 4242 4242` |
| Requires 3D Secure authentication | `4000 0025 0000 3155` |
| Declined (generic) | `4000 0000 0000 0002` |
| Declined (insufficient funds) | `4000 0000 0000 9995` |

**Try these discount codes:** `HOLIDAY20` (20% off), `KICKSTART10` (10% off), `GIFTKIT15` (15% off orders over $75, auto-applied with gift bundles), `TAKE10` ($10 off orders over $60). `SUMMER25` is expired, so you can see the error state.

## Email (Resend)

Set `RESEND_API_KEY` and an `EMAIL_FROM` on a domain you've verified in Resend. Emails sent:

- Magic sign-in link
- Order confirmation, with download links for digital items
- Shipping notification with a carrier tracking link (sent when an admin adds tracking)
- Free 7-day workout plan (lead magnet)
- Brand inquiry notification to the team, plus an auto-reply to the brand

Without a key, every email is rendered and printed to the server console, so you can test every flow locally.

## Image and file uploads (Cloudinary)

Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`. The admin then uploads:

- **Product images:** signed direct browser-to-Cloudinary uploads
- **Digital files:** uploaded as `authenticated` raw assets (not publicly reachable). Downloads go through the app, which checks the signed token and order status, then redirects to a five-minute signed Cloudinary URL

Without Cloudinary, admins can paste Unsplash or Cloudinary image URLs, and digital files are stored on local disk in `storage/uploads/` (development only).

## Google sign-in

Create an OAuth 2.0 Web client in Google Cloud Console. Add `<NEXT_PUBLIC_SITE_URL>/api/auth/callback/google` as an authorized redirect URI, then set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`. The Google button appears automatically.

## Deploying to Vercel

1. Push the repo to GitHub and import it in Vercel.
2. Create a Neon database (Vercel Marketplace → Neon) or use Supabase. Set `DATABASE_URL` to the pooled URL and `DIRECT_URL` to the direct URL.
3. Add the environment variables from `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to your production URL.
4. Set the **Build Command** to `npm run vercel-build`. This runs `prisma generate`, `prisma migrate deploy` and `next build`.
5. Deploy, then seed once from your machine against the production database:

   ```bash
   DATABASE_URL="<production direct url>" npm run db:seed
   ```

6. In Stripe → Developers → Webhooks, add the endpoint `https://<your-domain>/api/webhooks/stripe` with the four events listed above. Put its signing secret in `STRIPE_WEBHOOK_SECRET` and redeploy.
7. Configure Cloudinary for uploads: Vercel's filesystem is read-only, so local uploads are disabled there. The seeded digital files ship with the deployment.

> For a real store, set `NEXT_PUBLIC_DEMO_MODE="false"`. This removes the banner and the demo logins. The app also refuses to run a live Stripe key while demo mode is on.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run vercel-build` | Generate, apply migrations and build (for Vercel) |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run db:local` | Start the zero-install local Postgres (PGlite) on port 5433 |
| `npm run db:migrate` | Create and apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |
| `npm run db:seed` | Reset and seed demo data (deletes existing data) |
| `npm run db:reset` | Drop, re-migrate and re-seed |
| `npm run db:studio` | Open Prisma Studio |
| `npm run stripe:listen` | Forward Stripe webhooks to localhost |
| `npm run test:webhook` | Verify webhook signature checks and idempotency |

## Project structure

```
prisma/
  schema.prisma           Data model (User, Product, ProductVariant, ProductImage, DigitalAsset,
                          Cart, CartItem, Order, OrderItem, DiscountCode, Review, Subscriber,
                          BrandInquiry + Auth.js tables, StripeEvent, RateLimit)
  seed.ts, seed-data.ts   Demo catalog written in Maya's voice
scripts/                  Local Postgres, digital file generator, webhook test
storage/digital/          Private downloadable files (never served directly)
src/
  app/
    (store)/              Storefront: home, shop, products, gift guide, about, media kit,
                          checkout success, login, account
    admin/                Dashboard (role-protected)
    api/                  Auth.js, Stripe webhook, signed downloads, admin uploads
  auth.ts, auth.config.ts Auth.js (full config / edge-safe config for proxy.ts)
  proxy.ts                Coarse route protection (Next 16's replacement for middleware)
  components/             UI by area: layout, product, cart, home, shop, account, admin, ui (shadcn)
  config/                 Site, gift guide and testimonial content
  emails/                 React Email templates
  lib/                    db, stripe, email, cloudinary, validation schemas, formatting
  server/
    actions/              Server actions (all validated with Zod, admin ones role-checked)
    queries/              Data access for pages
    orders/fulfill.ts     Idempotent payment fulfilment
    downloads.ts          Signed, expiring download tokens
    rate-limit.ts         Postgres-backed fixed-window rate limiter
  stores/cart-store.ts    Client cart (Zustand + localStorage)
```

## Design notes

- **Mobile first.** Every layout starts at 375px. The cart, filters and navigation use bottom or side sheets on mobile.
- **One accent.** The palette is ink, warm white and an "ember" orange. Ember fills always carry ink text, and a darker ember is used for text on light backgrounds, so contrast meets WCAG AA.
- **Accessibility.** Semantic landmarks, a skip link, labelled controls, keyboard-operable gallery and pickers, live regions for cart and stock messages, visible focus rings, `prefers-reduced-motion` support, and a table view for the revenue chart.
- **Money** is stored as integer cents. Prices are always re-read from the database at checkout; the client cart is only a display copy.
