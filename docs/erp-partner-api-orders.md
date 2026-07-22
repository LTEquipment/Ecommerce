# Partner API — `POST /orders`, and two things that block integration

Measured against the live API on 2026-07-22. Every claim below has the exact
call that produced it. Where I could not determine something, it says so rather
than guessing — the last brief guessed and was wrong.

## 1. I created three junk orders. Please delete them.

`TEST-4729923509`, `TEST-4729924816`, `TEST-4729925500` — all dated 2026-07-22,
`stage: pending`, `external_source: "TEST"`.

They came from probing for the request contract (see §3 for why probing was
necessary). I expected a validation error and got `200 ok`. My mistake, and I
could not clean up: `/orders` has no `DELETE`, and `PATCH` was outside what I
was permitted to run.

Real order `SO260708001BK` is untouched.

## 2. `POST /orders` accepts almost anything

This is the finding that matters. The entire request body:

```bash
curl -X POST "$ERP_API_URL/orders" -H "x-api-key: $KEY" \
  -H 'content-type: application/json' -d '{"lines":[{"sku":"X"}]}'
# → 200 {"ok":true,"id":"TEST-4729923509","external_id":null,"items":1}
```

That order has **no customer, no amount, no date, no quantity, no price**, and
its SKU is the literal string `X`, which is not in the catalog. It was created
anyway.

| Field | Validated? |
| --- | --- |
| `lines[]` non-empty | yes — the only check |
| `lines[].sku` exists in catalog | no |
| `lines[].qty` | no — optional |
| `lines[].unit_price` | no — optional |
| customer / amount / date | no — all optional |

`{}` and `{"lines":[]}` both correctly return `400 {"error":"lines[] required"}`.
That is the only validation present.

**Why this needs fixing before go-live.** The storefront is a public website. If
this endpoint is reachable with a leaked or brute-forced key, `sales_orders`
fills with unattributable garbage that looks exactly like real demand — and it
feeds whatever reporting sits downstream. Suggested minimum: require `customer`
and `amount`, reject unknown SKUs, and reject `qty <= 0`.

## 3. Unknown routes return 403, not 404 — so the API cannot be explored

```bash
curl "$ERP_API_URL/banana" -H "x-api-key: $KEY"
# → 403 {"error":"No permission for GET banana. Need: banana. Allowed: products, …"}
```

The permission gate derives a permission name from the first path segment and
rejects before routing. So a missing endpoint and a forbidden one are
indistinguishable. `GET /leads`, `GET /customers`, `GET /invoices` and
`POST /quotes` all return the same 403 as `/banana` does.

This is also why §1 happened: `openapi.json` lists paths but carries **no request
or response schemas** (`requestBody` and `responses` are both `{}` for
`POST /orders`), and 403 revealed nothing, so the only way left to learn the
contract was to send bodies and read the errors.

Two fixes, either helps: return `404` for routes that do not exist, or publish
request schemas in `openapi.json`.

## 4. Unknown keys are accepted silently

The API did not reject any field I sent. So an integrator cannot tell a field
that was stored from one that was dropped — both look like success. We now send
`external_id`, `customer`, `amount`, `ship`, `po_number` and others on the shape
of your `sales_orders` table, but **none of it is confirmed to persist**, because
`GET /orders` returns only 7 fields (`id, date, stage, status, external_id,
external_source, updated_at`) and none of them are the ones in question.

Same root cause as the sparse `GET /products` you already fixed. Could `GET /orders`
return the full row?

## 5. Is this key production?

`GET /health` still reports `"partner": "TEST"`, and every order it creates is
stamped `external_source: "TEST"` with a `TEST-` prefixed id.

**Order push is switched off on the storefront until someone confirms this.**
It needs `ERP_ORDER_PUSH=on` in addition to the API credentials, specifically so
that having catalog-sync credentials on the box cannot silently start posting
real customer orders into a test tenant.

## 6. CRM and finance: what we would need, and what we do not want

The ask was to connect CRM and accounting. Scope we agreed on our side is
**outbound only** — the storefront pushes, and reads nothing back:

| Flow | Needs |
| --- | --- |
| Trade-account registration → `crm_leads` | `POST /leads` + `write_leads` |
| Quote request → `cpq_quotes` | `POST /quotes` + `write_quotes` |
| Order → `sales_orders` | works today (§2, §5) |

Quote requests are already captured in the storefront's own `quote_requests`
table, so nothing is being lost while this is unavailable — they can be
back-filled once the endpoint exists.

**We are explicitly not asking for read access to customers, invoices, or
anything else.** `customers` alone carries `ein`, `ein_encrypted`,
`tax_exempt_id`, `credit_limit`, `credit_notes`, `dealer_notes` and `intel` on
the same row — a customer-facing read of that table would hand a customer both
their own tax ID and our internal notes about them. If a self-service portal is
wanted later, it should be a purpose-built endpoint returning an explicit field
list, not a table read.
