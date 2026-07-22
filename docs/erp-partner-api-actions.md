# For the storefront team: what to change before order push can be switched on

Date: 2026-07-22
Companion to `2026-07-22-orders-hardening-reply.md`. Read the reply for the
evidence; this file is only the actions.

You are working on the **storefront** (Next.js). The ERP is a separate codebase
and a separate Supabase project. You have no access to it and should not try to
get any — everything here is done through the Partner API or in storefront code.

---

## Before anything else

**Your three junk orders are already deleted.** `TEST-4729923509`,
`TEST-4729924816`, `TEST-4729925500`, with their line items. Nothing left to
clean up. `SO260708001BK` was never touched.

**Do not switch on `ERP_ORDER_PUSH`.** Not as part of this work, not to test.
See §5 at the bottom — the question you raised is still open and the answer so
far makes it more important, not less.

**Do not write to any ERP table directly**, even if you find credentials that
would allow it. The Partner API is the only supported path and it is now the
only one that validates anything.

---

## Wait for the ERP deploy before re-measuring

The ERP changes are **committed but not live**. The Supabase CLI is not
installed on the ERP machine and that checkout is linked to the wrong project.
Until someone deploys, every request behaves exactly as it did when you wrote
your brief.

This also applies to the `GET /products` field fix from 2026-07-21 — your §4
assumed it had shipped. It may not have. Check both before trusting anything:

```bash
# 26 = the products fix is live, 13 = it is not
curl -s -H "x-api-key: $KEY" "$BASE/products?limit=1" | jq '.products[0]|keys|length'

# 404 = this round is live, 403 = it is not
curl -s -o /dev/null -w '%{http_code}\n' -H "x-api-key: $KEY" "$BASE/banana"
```

If either returns the old value, **stop and report it**. Do not work around it
and do not re-derive conclusions from an API that has not changed.

---

## 1. Fix the order payload

`POST /orders` now validates before writing. Unknown fields are rejected instead
of silently dropped, so your current payload will start failing — that is the
point, but it means this change is required, not optional.

**Rename `ship` → `shipping_address`.** `ship` was never a field the API knew;
it was being discarded.

**Remove `po_number`.** There is no such column on `sales_orders`. If the
storefront genuinely needs to carry a customer PO, say what it should map to and
the ERP will add a column — do not stuff it into `notes` as a workaround without
saying so.

Required on every order:

| Field | Rule |
| --- | --- |
| `customer` | non-empty string. An empty string now fails. |
| `lines[].sku` | must match a product `id`, `item_number` or `model_number` |
| `lines[].qty` | number, greater than 0 |
| `lines[].unit_price` | number, 0 or more |

Optional, but validated if you send them:

| Field | Rule |
| --- | --- |
| `amount` | >= 0, and **not below** the line subtotal. Freight and tax may push it above. Omit it and the API uses the subtotal. |
| `stage` | one of `sales_order`, `invoice`, `paid`, `closed`. Omit it — the default is correct. |
| `date` | must parse as a date |
| `id` | must start with your partner prefix. Easiest: do not send it. |

A valid order:

```json
{
  "external_id": "web-10432",
  "customer": "Golden Wok Inc.",
  "contact": "May Lin",
  "phone": "(718) 555-0101",
  "shipping_address": "88-21 Roosevelt Ave, Flushing NY 11372",
  "amount": 8850.00,
  "notes": "Deliver after 2pm",
  "lines": [
    { "sku": "CR-105-S2(H)", "name": "HD 3-Burner Wok Range", "qty": 1, "unit_price": 8558.00 }
  ]
}
```

## 2. Use `item_number` as the SKU

Unchanged from the last list, and now enforced: an unknown SKU is a `400`
instead of a silently-booked unfulfillable line.

- `item_number`: 262 / 262 populated
- `model_number`: 244 / 262 — 18 rows would fall through

Fall back to `model_number`, then `id`. Never to the product name.

**This makes a stale catalog cache fail loudly.** If the storefront caches
products and the ERP renames or retires a SKU, checkout will start returning
`400 sku not in catalog`. Handle it — see the next item.

## 3. Handle the new `400` shape

Errors now name every fault at once:

```json
{"error":"Invalid order","problems":[
  "customer required",
  "lines[0].qty must be a number > 0",
  "sku not in catalog: X"]}
```

Requirements:

- **Never retry a `400` unchanged.** It is deterministic; a retry loop just
  burns rate limit.
- **Log `problems[]` verbatim** and surface it to whoever owns checkout. Do not
  collapse it to "order failed".
- **Do not drop the order.** If the push fails, the customer has still paid.
  Queue it and alert — a failed push must never be silent, which is the whole
  lesson of this round.

## 4. Use `Idempotency-Key` on retries

For genuine retries (timeout, 5xx, network drop), send the same
`Idempotency-Key` header. Repeating an `external_id` also returns the existing
order rather than creating a duplicate, so both guards are in place — use them
rather than checking whether an order "probably" went through.

## 5. `GET /orders` — remove your workarounds

It now returns 18 fields instead of 7, and is scoped to your own orders only.
Added: `amount`, `customer`, `contact`, `phone`, `payment_terms`,
`shipping_address`, `shipping_method`, `shipping_sent_at`,
`requested_delivery_date`, `currency_code`, `created_at`.

`shipping_sent_at` is the field to drive "your order has shipped" from. If you
built anything that inferred status from `stage` alone, replace it.

You will not get the full row and should not ask again — it carries margin
overrides and internal credit notes, for the same reason you refused read access
to `customers`.

## 6. `/leads` and `/quotes` — build, but expect 403 until permissions land

Both are new and both are write-only.

```
POST /leads    → needs write_leads
POST /quotes   → needs write_quotes
```

Your key does not have these yet. Adding them is an ERP-admin action that has
not happened, so **expect `403` and do not treat it as a bug in your code.**
Build against the schemas in `openapi.json`, and gate the calls behind a flag
until the permissions are confirmed.

`POST /leads` requires `company` plus at least one of `email` / `phone`.

`POST /quotes` **creates a CRM lead, not a CPQ quote**, and says so:

```json
{"ok":true,"id":"…","created":"lead","note":"Quote requests are filed as CRM leads…"}
```

This is deliberate — read §6 of the reply for why. **Do not label it "quote
submitted" in the UI if that implies a priced quote exists.** It means "we have
your request and a person will price it".

Keep writing to the storefront's own `quote_requests` table as the source of
truth in the meantime, so nothing depends on this shipping.

## 7. Confirm the earlier list is done

From 2026-07-21, never reported back on:

1. Did the `GET /products` deploy land — 13 keys or 26?
2. Is the keyword matcher deleted and `product_type` used for departments?
3. Is `stock: null` + `stock_tracked: false` handled as "not tracked" rather
   than "sold out"?
4. Are the 42 numeric-name products still present and rendering
   `model_number` as the title? **They must not be deleted** — they are real
   products with prices and images.

---

## Report back on

1. **Deploy status** — both curl checks above, with their actual output.
2. **What `po_number` should map to**, or confirmation that it is dropped.
3. **Any order field you send that is not in the table in §1** — it will now
   `400`, so list it before you find out in production.
4. **Whether `customer` can ever be empty** in your checkout flow (guest
   checkout, marketplace orders). If it can, say so now rather than discovering
   it when an order fails.

## Do not

- Turn on order push.
- Delete or "clean up" any ERP product or order.
- Retry `400`s.
- Work around a failed deploy check.
- Invent a mapping for `po_number`.

## Open, and not yours to close

`GET /health` still reports `"partner": "TEST"`. There is exactly one partner
key in the ERP database, it is named `TEST`, and it writes to the production
project. There is no test tenant. Your instinct to gate on a separate
`ERP_ORDER_PUSH` flag was right; keep it off until a person — not a Claude on
either side — confirms which key real orders should use.
