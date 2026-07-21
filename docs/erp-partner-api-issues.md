# ERP Partner API — issues blocking the storefront integration

Findings from integrating `LTEquipment/Ecommerce` (public storefront) against the
ERP Partner API on 2026-07-21. Everything below was measured against the live
API, not inferred from code.

**Base URL:** `https://lhqijcgxhygepjnbccxu.supabase.co/functions/v1/partner-api`
**Auth:** `X-API-Key`
**Key used:** reports `"partner": "TEST"` with all 8 permissions granted.

Reproduce any of it with:

```bash
curl -H "x-api-key: $KEY" "$BASE/products?limit=50&page=1"
```

The API itself works well — auth, pagination, rate limits and the docs are all
fine. **Every problem below is product data, not the API contract**, except §6.

---

## 1. No product carries a `model_number` (blocking)

**0 of 262** products have a non-null `model_number`.

This is the biggest blocker. The documented dedupe/update key is
`match_by: "model_number"`, and the storefront needs a stable, human-meaningful
SKU because it renders "MODEL 52527" on every product card and uses it in URLs.

Right now the only stable identifier is `id` (e.g. `EXT-MR9R8DUX-OBBCS`), which
means:

- customers would see `MODEL EXT-MR9R8DUX-OBBCS` on the shop
- re-syncing can only match on an opaque id, so if a product is recreated in the
  ERP it becomes a *new* product on the storefront and the old one is orphaned

**Ask:** populate `model_number` (or `item_number`) for all sellable products.
These should be the real manufacturer model numbers — the storefront's previous
catalog used values like `52527`, `58079`, `DCHPA48`, `DCF5-LPG`, `ST-120-3`.

## 2. 42 products are placeholder rows

42 of 262 have names that are only digits: `"1"`, `"10"`, `"11"`, `"12"` …
They carry real prices (e.g. `16368.00`) but no other identifying data.

The storefront currently skips them, but they are presumably wrong in the ERP
too — they would appear in quotes and sales orders as a product called "11".

**Ask:** delete them, or give them real names. If they are intentional
placeholders, add a flag so consumers can filter them deterministically rather
than guessing from the shape of the name.

## 3. `stock` is `0` on every product — "not tracked" is indistinguishable from "sold out"

**0 of 262** products report `stock > 0`.

A storefront has to decide between "In stock" and "Backorder" per product. If we
trust this field literally, **the entire catalog shows as Backorder**, which is
false and would cost sales. We currently ignore the field entirely and mark
everything sellable — also not correct, just less harmful.

**Ask:** either

- populate real quantities from `company_stock`, and return `null` (not `0`) for
  products that genuinely aren't stock-tracked; or
- add an explicit `stock_tracked: boolean` / `availability` field.

The distinction matters: `0` should mean "none left", `null` should mean "we
don't track this".

## 4. `category` has only two values for the whole catalog

Every product is `"Gas Equipment"`, `"Sinks"`, or an empty string.
`GET /categories` returns the two named ones.

That cannot drive a storefront. The shop has ten departments — Wok Ranges,
Steamers, Roasters & Ovens, Refrigeration, Ventilation & Hoods, Multipurpose
Cookers, Electric & Automation, Small Appliances, Kitchenware, Accessories — and
"Gas Equipment" spans at least four of them.

We currently derive the department by keyword-matching the **product name**,
which works (82 steamers, 80 wok ranges, 16 roasters, 22 kitchenware) but is
fragile: it silently misfiles anything worded unusually, and 19 products match
nothing and fall back to Accessories.

**Ask:** a real product taxonomy — either meaningful `category` values, or the
existing `category_schema_slug` / `series` populated and exposed so consumers
can map deterministically instead of guessing from prose.

## 5. Duplicate product names (minor)

10 names are used by exactly 2 products each. Nothing repeats more than twice.

This is only a problem because of §1: with no `model_number`, the storefront has
to build URLs from names, so a duplicate name needs a `-2` suffix. Harmless once
model numbers exist.

*Correction:* an earlier draft of this brief claimed one name repeated 7 times.
That was wrong — the 7-way collision was produced by the storefront truncating
slugs to 60 characters, which made several long, genuinely different "Custom
Made Back Drainage Ductile Iron Wok Range …" names collide *after* truncation.
That is a storefront bug, not an ERP data problem, and is fixed on our side.

## 6. `GET /products` returns very few fields

The write side documents "70+ fields accepted (specs, dimensions, images,
docs)". `GET /products` returns **13 keys**:

```
id, name, category, series, source_type, price, stock,
image_url, weight, width, depth, height, updated_at
```

Absent from the response, though documented as writable:
`description`, `brand`, `model_number`, `specsheet_url`, `manual_url`, `btu`,
`voltage`, `certification`, `country_of_origin`.

A product page needs description, brand, specs and spec-sheet links. Without
them the storefront can only show a name, a price and one photo.

**Ask:** return the documented fields on `GET /products` — ideally honouring the
`?fields=a,b,c` sparse-fieldset parameter the docs mention, so consumers can ask
for what they need without inflating the default payload.

## 7. Two questions to confirm

1. **Is this key production?** `/health` reports `"partner": "TEST"`. Before the
   storefront writes real customer orders through `POST /orders`, confirm this
   key and project are production and not a sandbox.

2. **Project ref mismatch.** In the ERP repo:
   - `.env` and `supabase/config.toml` → `lhqijcgxhygepjnbccxu`
   - `supabase/.temp/linked-project.json` → **`noivbdiggvzilabjzxkj`** (also named "ERP")

   The CLI's last-linked project is not the one the app talks to. Anything
   deployed with `supabase functions deploy` / `db push` from that checkout may
   land in the wrong project. Worth reconciling before the next deploy.

---

## Priority

| # | Issue | Blocking? |
|---|-------|-----------|
| 1 | No `model_number` | **Yes** — no stable SKU, ugly public URLs and card labels |
| 3 | `stock` always 0 | **Yes** — whole catalog reads as Backorder, or availability is fiction |
| 4 | Two categories only | **Yes** — department mapping is guesswork |
| 6 | Sparse `GET /products` | High — product pages have no description or specs |
| 2 | 42 placeholder rows | Medium — skipped, but wrong in the ERP too |
| 5 | Duplicate names | Low — 2x each, resolves itself once §1 is fixed |
| 7 | TEST key / project ref | Confirm before writing real orders |

Fixing §1, §3 and §4 makes the catalog sync correct rather than best-effort. §6
makes the product pages worth visiting.

## What the storefront already does

Working, and needs nothing from the ERP:

- `POST /orders` — storefront orders are mapped to sales orders, idempotent on
  `external_id`, never blocking checkout if the ERP is unreachable.
- `GET /products` pagination, auth, rate limits — all fine.
