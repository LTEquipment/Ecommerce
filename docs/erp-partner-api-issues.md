# ERP Partner API — storefront integration

Original brief: 2026-07-21. **Superseded by the ERP team's reply the same day.**
This file now records what was wrong, what was right, and where things stand.

---

## The brief's headline finding was wrong

It claimed **0 of 262 products carry a `model_number`** and called it the
biggest blocker. That was false.

| Field | Actually populated | Brief reported |
| --- | --- | --- |
| `model_number` | 244 / 262 | 0 |
| `item_number` | 262 / 262 | not mentioned |
| `product_type` | 241 / 262 | not mentioned |
| `series` | 262 / 262 | not mentioned |

Re-measured against the deployed API — every figure in the ERP team's reply is
confirmed exactly.

**How it happened.** The count was taken through `GET /products`, which did not
return `model_number`. The brief's own §6 listed the thirteen fields that
endpoint returned, and `model_number` was not among them. So §1 and §6
contradicted each other and the conclusion went out anyway.

A field missing from a response is not a field missing from the database. One
call to `GET /schema`, or reading the table directly, would have caught it.
**When a field reads empty for every single row, suspect the instrument before
the data** — 100% of anything is a measurement artefact until proven otherwise.

## The brief proposed destroying real inventory

It recommended deleting the 42 products whose names are digits (`"1"`, `"11"`,
`"23"`), calling them placeholder rows. They are not.

| | |
| --- | --- |
| Carry an `item_number` | 42 / 42 |
| Carry a real price | 42 / 42 |
| Carry a `model_number` | 26 / 42 |
| Carry an image | 28 / 42 |

Their `item_number`s run consecutively (55557, 55558, 55559 …) — the signature
of a spreadsheet import that lost its header row, not of placeholders. The names
are row numbers.

They are now listed on the storefront under their model number. Nothing was
deleted; the recommendation was never acted on.

**The reasoning was too thin for the consequence.** "The name looks like a
number" was treated as sufficient evidence to propose deleting priced, imaged,
sellable products, without checking a single other field on the row.

## What the brief got right

- **§3 `stock` always 0** — real. Now fixed API-side: `stock: null` with
  `stock_tracked: false` where nothing is counted, so `0` means "none left"
  again.
- **§6 sparse `GET /products`** — real, and the root cause of §1, §4 and most of
  §5. Now returns 27 fields including `description`, `brand`, `model_number`,
  `item_number`, `product_type`, `series`, spec-sheet and manual links.
- **§4 `category` is unusable** — partly real. It holds only `Gas Equipment`,
  `Sinks` and empty. But `product_type` (ten values) was always the right
  mapping key and simply was not exposed.
- **§7 project ref mismatch** — confirmed stale. `supabase/.temp` points at
  `noivbdiggvzilabjzxkj`; the live project is `lhqijcgxhygepjnbccxu`. Relink
  before any deploy from that checkout.

## Storefront changes made in response (`3c557ee`)

| Was | Now |
| --- | --- |
| SKU from `id` (`EXT-MR9R8DUX-OBBCS`) | `item_number`, falling back to `model_number`, then `id`. Never the name. |
| Slugs from product names, truncated to 60 chars | Slugs from the SKU |
| Department from keyword-matching the name | Exact lookup on `product_type` |
| 42 numeric-name products skipped | Listed, titled by model number |
| `stock` ignored entirely | Follows the `stock_tracked` contract |

Simulated against all 262 live products: **262 listed, 0 skipped, 0 slug
collisions.** The previous version would have listed 220 and dropped 42
sellable products.

The seven-way slug collision the brief reported was also ours: names truncated
to 60 characters made several genuinely different "Custom Made Back Drainage
Ductile Iron Wok Range …" products collide *after* truncation. Keying on SKU
removes it.

## Still open

1. **Is the key production?** `/health` reports `"partner": "TEST"`. Unanswered,
   and it needs a person. **No real customer orders should go through
   `POST /orders` until someone confirms it.**

2. **21 products have no `product_type`.** Their `series` is `"Standard"` or
   `"Gas Equipment"`, neither of which identifies a department, so they are
   filed under Accessories and counted in the sync report. ERP-side gap.

3. **`lifecycle_status` is `"active"` for all 262**, including the 42 renamed
   rows and the 14 the ERP team said are archived. So the storefront cannot use
   it to filter, contrary to the reply's suggestion — either the API filters
   archived rows out before returning them, or `archived_at` is not reflected in
   `lifecycle_status`. Worth a look.

4. **`description` is populated on only 49 / 262.** Not a blocker, but product
   pages for the other 213 will have no copy.
