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

- Home storefront: top bar, header + department nav, hero, trust bar,
  department grid, faceted catalog (department / price / availability + sort),
  product cards, credibility band, newsletter, footer.
- Working cart drawer (add / qty / remove / subtotal + freight), search, filters
  and toast — all client-side over the fetched catalog.
- Brand: L&T logo + brand red (`#BE1E2D`) as the single accent; golden-ratio
  (φ = 1.618) type scale and Fibonacci spacing; favicons wired.

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

Product detail pages, checkout/payments, trade-account auth, real product
photography. The data layer and schema are shaped to receive all of it.

> Concept build — sample products, SKUs, prices and copy are placeholders.
