# L&T — Commercial Kitchen Storefront

Modern storefront for L&T Kitchen Supply, built with **Next.js (App Router) +
TypeScript**. Runs on mock data today; wired for **Supabase** (Postgres + Auth +
RLS) when you're ready. Deploys to **Vercel** as-is.

## Run locally

```bash
npm install
npm run dev
# http://localhost:3000
```

Requires Node 18.17+ (Node 20 recommended).

## Deploy

Push to GitHub, import the repo in Vercel — no config needed. Add the Supabase
env vars in Vercel once you connect the backend.

## What's built

- **Full multi-page store** (App Router): home, all-products, per-department
  category pages, product detail (gallery + spec sheet + related), cart page,
  multi-step checkout, login / register, account dashboard (orders + profile),
  about, contact, locations.
- **Real catalog** — Panda® / L&T products, prices, specs and **real photos**
  (`lib/products.ts`, `public/products/`) across 10 departments.
- **Login + cart rework**: header account button routes to `/login` (or an
  account dropdown when signed in); reachable in the mobile bar. Cart is both a
  quick-view drawer *and* a full `/cart` page, and **persists to localStorage**
  so it survives navigation and refresh.
- **Real Supabase auth** (`@supabase/ssr` + middleware) — see setup below.
  Orders placed while signed in save to the `orders` table and show in `/account`.
- **Golden-ratio layout system** (`app/globals.css`): φ = 1.618 layout splits,
  Fibonacci spacing/type scale, and a fully responsive **mobile shell**
  (collapsing header bar + slide-in nav, full-width drawer, stacked grids).
- Brand: L&T logo + brand red (`#BE1E2D`) as the single accent; favicons wired.

## Auth setup (Supabase)

Auth pages render without keys but can't sign in until you connect Supabase:

1. Copy `.env.example` → `.env.local` and fill `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor (creates
   `customers` / `orders` / `order_items` + RLS).
3. Restart `npm run dev`. Registration, sign-in, and order history now work.

## Data & Supabase

The catalog comes from `lib/catalog.ts` (`getCategories()` / `getProducts()`),
which currently returns typed mock data. Swap those function bodies for Supabase
queries later — components never change. See `lib/supabase/README.md` and
`supabase/schema.sql`.

## Structure

```
app/
  layout.tsx        fonts, favicon metadata, StoreProvider
  page.tsx          composes the home page (server; fetches catalog)
  globals.css       full design system (ported from the approved concept)
components/
  StoreProvider     client state: cart, filters, toast, drawer
  Header, Hero, TrustBar, Departments, Catalog, ProductCard,
  CartDrawer, Band, Signup, Footer, Toast, TopBar, icons
lib/
  types.ts          Category / Product types
  catalog.ts        data layer (mock now → Supabase later)
  illus.ts          product illustrations (placeholders for real photos)
  format.ts         money()
  supabase/         client stub + wiring notes
supabase/
  schema.sql        tables + RLS to run later
public/             logo + favicons
```

## Not built yet (next up)

Real payment processing (checkout is a demo — card entry is UI-only, nothing is
charged) and ERP/inventory sync. The data layer and schema are shaped to
receive both.

> Concept build — product data, photos and copy are sourced from L&T's own
> sites (pandarange.com / ekitchensupply.com); ratings and badges are
> illustrative.
