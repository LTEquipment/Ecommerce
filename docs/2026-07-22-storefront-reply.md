# Storefront → ERP: report-back, 2026-07-22

Answers to the four items, then two things that need your side.

`ERP_ORDER_PUSH` is off and stays off.

---

## 1. Deploy status — both live

```
curl -s -H "x-api-key: $KEY" "$BASE/products?limit=1" | jq '.products[0]|keys|length'
→ 27          (expected 26; one more than documented — worth a look, but not blocking)

curl -s -o /dev/null -w '%{http_code}\n' -H "x-api-key: $KEY" "$BASE/banana"
→ 404         (was 403)
```

`GET /orders` returns `total: 0`, which also confirms per-partner scoping is
live — our three junk orders are gone and `SO260708001BK` is correctly not ours
to see. Thank you for clearing them.

## 2. `po_number` → riding in `notes`, declared

It is a real field: B2B checkout captures it and the storefront stores it on its
own `orders` row. Dropping it entirely would mean the PO is missing from the
paperwork the ERP produces, which is where it actually matters.

So it goes in `notes` in a fixed format, flagged here rather than done quietly:

```
Customer PO: PO-88213 · Paid by: net30
```

**Please add a `po_number` column** and we will move it out of `notes` the same
day. Until then, anything parsing `notes` should expect that prefix.

## 3. Fields we were sending that are not in your §1 table

All removed, since unknown keys now `400`. Listing them because two are real
losses, not dead weight:

| Field | Status |
| --- | --- |
| `ship` (object) | → `shipping_address`, flattened to one line |
| `placed_at` | → `date` |
| `po_number` | → `notes`, see §2 |
| `external_source`, `id`, `stage` | dropped — you assign them |
| `currency_code` | dropped — USD is your default |
| **`email`** | **dropped, and this one needs an answer** |
| `payment_method` | folded into `notes` |

**`email` is the one to look at.** We capture a customer email on every order,
including guest checkout, and there is no documented field for it. Right now the
ERP receives an order it cannot email — only `contact` and `phone`. The
storefront retains it, so nothing is lost, but if the ERP sends order
confirmations or invoices by email it currently cannot for web orders. Tell us
the field and we will send it.

## 4. Yes — `customer` could be empty. Fixed.

The old value was `company || ship_company || ship_name || contactEmail`, and
**all four can be absent simultaneously**: `contactEmail` is `null` unless it
passes validation, and the ship-to fields are optional. That order would have
sent `customer: null` and `400`ed under the new rules.

It now falls back to `Web order <order_id>`, which always exists. A reference
beats a rejected order. Guest checkout is supported and will often have no
company name, so this path is normal traffic, not an edge case.

---

## 5. Your §7 item 4 is wrong, and it matters

You wrote that the 42 numeric-name products "are real products with prices and
images" and "must not be deleted".

We have not deleted anything, in the ERP or otherwise. But the premise is off:

```
digit-only names:                  42 / 262
  of those, no model_number:       16
  of those, priced at exactly $1:  20
```

Twenty of the 42 are priced at **$1.00**. And the problem is wider than those
42 — across the whole catalog:

| | |
| --- | --- |
| Exactly $1.00 | **21** |
| $1.01 – $99 | 5 |
| $100 – $999 | 3 |
| $1,000+ | 233 |
| Median | **$10,538** |

Nothing at all falls between $1.00 and $1.01. That is a sentinel, not a price.

**Five of the 21 have entirely normal names** — `CRH-P-1` through `CRH-P-4` are
wok ranges, plus a steam cabinet handle. Nothing on the listing page looked
wrong. A customer could have bought a wok range for a dollar.

The storefront now withholds any product at or below $1.00 and reports them by
SKU in the sync result. The ERP rows are untouched and will list themselves the
moment a real price exists. We also no longer let a `$1.00` feed value overwrite
a real price on a product already being sold.

**Please confirm $1.00 is your placeholder convention.** If it is a real price
for some line we will special-case it, but we are not putting them back on a
public shop at a dollar on assumption.

## 6. 21 products hotlink a competitor's CDN

`image_url` on 21 rows points at `www.kitchenall.com`. Those are not ours to
serve, and they broke the storefront: `next/image` throws rather than degrades
on an unconfigured host, so every page rendering one of them returned 500 —
home, all listings, 21 product pages.

Fixed our side by filtering image hosts, so a stray URL now costs one photo
instead of the page. But those 21 products have no usable photography until the
ERP rows are corrected.

## 7. Earlier list — status

1. **`GET /products` deploy** — live, 27 keys.
2. **Keyword matcher** — deleted. Departments come from `product_type` via an
   exact lookup. 21 rows have no `product_type` and land in Accessories, counted
   and reported.
3. **`stock: null` + `stock_tracked: false`** — handled as "not tracked", not
   "sold out". Only `stock_tracked === true` with `stock <= 0` shows Backorder.
4. **The 42** — 26 are listed under their model number as intended. The other
   16 are withheld, per §5: they have no model number, so the title fell through
   to `item_number`, which is itself a bare number — they were live titled
   "58377", "59301". They are also all $1.00. Withheld, not deleted.

## 8. Not yet built: `/leads` and `/quotes`

Understood as write-only and expected to `403` until permissions land. Not built
this round. Quote requests continue to land in the storefront's own
`quote_requests` table as the source of truth, so nothing waits on it.

When built, `POST /quotes` will be labelled "request received — we will price
this" and never "quote submitted".

## 9. Still open on our side, stated plainly

There is **no durable queue** for a failed push yet. Failures are logged loudly
with `problems[]` verbatim and marked retryable or not, but a push lost to an
outage is not automatically replayed. That must exist before `ERP_ORDER_PUSH`
goes on, and it is the reason it is off beyond the `TEST` key question.

## 10. Agreed, and not ours to close

One partner key, named `TEST`, writing to the production project, no test
tenant. Order push stays off until a person confirms which key real orders
should use.
