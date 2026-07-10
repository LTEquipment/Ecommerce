# L&T Storefront Build-Out — Design

**Date:** 2026-07-10
**Status:** Proposed (awaiting user review)

## Goal

Turn the current single-page L&T storefront scaffold into a complete, multi-page
commercial-kitchen store using **real product data and photos** scraped from the
company's own sites (pandarange.com, ekitchensupply.com), with **real Supabase
authentication**, a reworked **login placement and cart**, and a layout system
built on the **golden ratio** that is **fully responsive down to a mobile shell**.

## Non-goals (YAGNI)

- No real payment processing (checkout is a realistic demo with a card-entry UI
  that does not charge anything).
- No ERP sync, wishlist, or product-review backend.
- No CMS — content pages are built from scraped copy held in typed `lib/` data.

---

## 1. Design system: golden ratio + responsive shell

The existing `globals.css` already declares φ and Fibonacci tokens. This becomes
the enforced backbone for **every** page, old and new.

**Ratio tokens (single source of truth in `:root`):**

- `--phi: 1.618`
- Spacing (Fibonacci px): `--f1:8 --f2:13 --f3:21 --f4:34 --f5:55 --f6:89`
  — all padding/margins/gaps snap to these.
- Type scale (φ-stepped): caption 12 → body 15 → h3 20 → h2 clamp(28,3.6vw,42)
  → h1 clamp(40,5.6vw,68). Each major step ≈ ×1.618.
- Major layout splits use φ: hero `1.618fr / 1fr`, product detail
  `gallery : info = 1.618 : 1`, content pages `text : aside = 1.618 : 1`.
- Media boxes use φ aspect ratios (`1.618/1` heroes, product image `1/1`).

**Responsive breakpoints (mobile-first intent, enforced consistently):**

| Width | Shell behavior |
|---|---|
| ≥1080px | Full desktop: multi-column grids, sticky facet rail, inline search |
| 600–1080px | Tablet: 2–3 col grids, facets collapse to a toggle, search inline |
| <600px | **Mobile shell** (below) |

**Mobile shell (<600px)** — this is the part called out as currently broken:

- Header collapses to: **logo · search icon · account icon · cart icon · hamburger**,
  all in one 56px bar; nothing hidden (`display:none` on account/cart is removed).
- Hamburger opens a **full-height slide-in nav** (departments + account links +
  phone), scrimmed, ESC/tap-to-close, focus-trapped.
- Search becomes a tap-to-expand full-width overlay (icon in the bar).
- Cart **drawer** goes full-width (`width:100vw`) on mobile.
- Grids: departments 2-col, products 2-col (1-col under 400px), facets in a
  bottom-sheet toggle.
- Tap targets ≥44px; sticky header respects safe-area insets.

---

## 2. Routing (Next.js App Router)

```
app/
  layout.tsx                 providers (Store + Auth), fonts, metadata
  page.tsx                   home
  category/[id]/page.tsx     department listing (faceted Catalog)
  products/[sku]/page.tsx    product detail
  cart/page.tsx              full cart page
  checkout/page.tsx          multi-step checkout (demo)
  login/page.tsx             sign in
  register/page.tsx          create account
  account/page.tsx           dashboard: profile + orders (guarded)
  about/page.tsx             company story (scraped)
  contact/page.tsx           phones/emails/form
  locations/page.tsx         showrooms + HQ (scraped)
```

Shared chrome (`TopBar`, `Header`, `Footer`, `CartDrawer`, `Toast`, mobile nav)
moves into `app/layout.tsx` so it wraps every route — not re-declared per page.

---

## 3. Login placement + cart rework

- **Account button is real.** Logged out → `/login`. Logged in → an
  **AccountMenu** dropdown ("Hi, {first name}" · Account · Orders · Sign out).
  Reachable on every breakpoint including the mobile bar.
- **Cart = drawer + page.** Drawer stays for quick "added ✓" feedback; its
  primary CTA becomes **View cart** → `/cart`. Checkout lives at `/checkout`.
- **Cart persistence (critical):** cart state moves from in-memory React state to
  **`localStorage`-backed** state so it survives navigation between the new pages
  and page refreshes. Hydration-safe (read on mount, no SSR mismatch).

---

## 4. Auth (real Supabase)

- Add `@supabase/ssr`; create browser + server clients and a `middleware.ts` that
  refreshes the session cookie. `/account` (and checkout's "place order") are
  guarded — unauthenticated users are redirected to `/login?next=…`.
- `AuthProvider` (client context) exposes `{ session, user, signIn, signUp,
  signOut }`; `Header`/`AccountMenu` consume it.
- **Dependency:** requires real keys in `.env.local`
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Without them the
  auth pages render but sign-in returns a friendly "backend not configured"
  message. A setup checklist ships in the README.

---

## 5. Data + images

- `lib/catalog.ts` gains the **real scraped catalog** (Panda wok ranges, steamers,
  roasters, electric, multipurpose, refrigeration, hoods, small appliances,
  accessories, kitchenware) with real names, model numbers, prices, and specs.
  New getters: `getProduct(sku)`, `getProductsByCategory(id)`, `getRelated(sku)`.
- `lib/types.ts` `Product` extends to: `images: string[]`, `specs: Record<string,
  string>`, `description`, `series`, keeping existing fields. `ArtKey` fallback
  retained for products lacking a photo.
- **Real photos** downloaded into `public/products/<sku>/…` and referenced from the
  catalog. `ProductCard`/gallery render the photo, falling back to the SVG illus.
- Categories updated to the real taxonomy; department tiles and nav reflect it.

---

## 6. Checkout (demo)

Multi-step on one page: **Contact → Shipping → Payment (card-entry UI, not
charged) → Review**. "Place order":

- If signed in and Supabase configured: inserts an `orders` + `order_items` row
  (schema already exists) and shows a confirmation with order number; the order
  then appears in `/account`.
- Otherwise: shows a demo confirmation without persisting.

Freight logic (free over $999, else $89) carries over from the drawer.

---

## 7. Components (new / changed)

**New:** `MobileNav`, `AccountMenu`, `AuthProvider`, `AuthForm`, `ProductGallery`,
`ProductDetail`, `SpecTable`, `RelatedProducts`, `CartPage`, `CheckoutFlow`,
`OrderSummary`, `AccountDashboard`, `Breadcrumbs`, content-page sections.

**Changed:** `Header` (real routing, account menu, mobile bar + hamburger),
`StoreProvider` (localStorage persistence), `CartDrawer` (full-width mobile, View
cart CTA), `ProductCard` (real photo + link to detail), `layout.tsx` (providers +
shared chrome), `globals.css` (φ tokens enforced, mobile shell, new page styles).

---

## 8. Testing / verification

- Verify each flow in the running dev server (preview): home → category → product
  → add to cart → cart page → checkout; login/register/account; and the mobile
  shell at 375px (header, hamburger nav, drawer, grids).
- Typecheck (`tsc`) and `next build` must pass.

---

## 9. Build order (feeds the implementation plan)

1. Design-system pass: φ tokens + responsive shell + mobile header/nav.
2. Data + images: real catalog, types, photo download, getters.
3. Shared chrome to `layout.tsx`; cart localStorage persistence.
4. Product detail + category pages.
5. Cart page + checkout flow.
6. Auth (Supabase) + login/register/account + middleware guard.
7. Content pages (about/contact/locations).
8. Verify all flows desktop + mobile; typecheck + build.
