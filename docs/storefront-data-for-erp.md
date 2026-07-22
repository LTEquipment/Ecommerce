# Storefront data for the ERP's CRM and finance

2026-07-22. Written for the ERP side. Everything below was measured against the
live storefront database today, not read off a schema file.

**Read §1 before planning any of it.**

---

## 1. There is almost no data yet

| Table | Rows |
| --- | --- |
| `orders` | **1** |
| `order_items` | 1 |
| `quote_requests` | **1** |
| `contact_messages` | 0 |
| `stock_notifications` | 0 |
| `subscribers` | 0 |
| `service_tickets` | 0 |
| `warranty_claims` | 0 |
| `product_reviews` | table does not exist |

The single order is `eeb66a96-0a39-41b2-b240-22c828ceb7ad`, $1,338.07 — **a test
order we created today while fixing a checkout bug.** It is not a real sale and
should be deleted. So the real count is zero.

You told us last round not to build a dealer-pricing endpoint against zero
customers. The same standard applies here, and harder: a CRM or finance reader
built now would be verified against a single fake row. **Define the contract
now, build the reader when there are orders.**

## 2. The bigger problem: the data you would read is incomplete

Three storefront migrations have not been run. The consequences are specifically
financial:

| Column | State | What it costs you |
| --- | --- | --- |
| `payment_status` | **missing** | You cannot tell a paid order from an unpaid one |
| `amount_paid` | **missing** | No partial-payment tracking |
| `paid_at` | **missing** | No revenue-recognition date |
| `tax_exempt` | **missing** | Cannot distinguish an exempt customer from a zero-rated sale — a sales-tax filing problem, not a cosmetic one |
| `po_number` | **missing** | Customer PO absent from your paperwork |
| `guest_email` | **missing** | Guest orders arrive with no contact address |

Every order placed today is saved **without those ten columns**. The checkout
logs `saved without: … — run the migrations` each time.

**Nothing on your side fixes this.** Until those migrations run, a finance reader
would be reading orders with no payment state at all.

## 3. Our recommendation: do not build a reader for orders

You already receive every order through `POST /orders`. Adding a second path
where the ERP reads the storefront means a public web application exposing
customer names, addresses, phones and order history behind a key — a new PII
surface to protect, for data you are already being sent.

**The reliable-push problem is the real one, and it is already solved on our
side:** the order row is its own replay queue, inconclusive pushes are retried
with the original `Idempotency-Key`, and deterministic rejections are held for a
human rather than retried. What that does not give you is a way to answer *"do I
have all of them?"*

So we propose exactly one read endpoint, and nothing else:

```
GET /api/erp/reconcile?from=2026-07-01&to=2026-07-31
→ { "orders": [ { "id": "...", "created_at": "...", "total": 1338.07, "status": "submitted" } ] }
```

Ids and totals only. Enough to diff against your `sales_orders` and find what
went missing; not enough to be worth stealing. If a diff shows a gap, the order
gets replayed through `POST /orders`, which is already the supported path.

If you want more than that, say what question it answers and we will scope it —
but the default answer for order data is "you already have it".

## 4. Where a real read is justified: CRM

Contact forms, quote requests and back-in-stock signups are **not** pushed to you
today — `write_leads` and `write_quotes` are still ungranted, so `POST /leads`
and `POST /quotes` return 403. Those tables are storefront-only right now.

Once permissions land we will push them and no reader is needed. Until then,
nothing is lost — they are accumulating on our side (currently 1 quote request,
0 contact messages).

Fields that exist today, measured:

**`quote_requests`** — `id, created_at, customer_id, name, company, email, phone, notes, subtotal, status`
**`quote_request_items`** — line items, joined on `quote_id`

## 5. What the orders table actually contains today

Measured, not from a schema file:

```
id, created_at, customer_id, status, subtotal, freight, total,
ship_name, ship_company, ship_phone, ship_address, ship_city, ship_state, ship_zip,
carrier, tracking_number, shipped_at
```

**Tax is not stored, but it is exactly derivable:**

```
tax = total − subtotal − freight
```

Verified on the one order: `1229.00 + 0.00 = 1229.00`, total `1338.07`, implied
tax `109.07` — 8.875% of subtotal, the NYC rate. The arithmetic is exact because
`total` is computed as `subtotal + freight + tax` server-side.

**The caveat that matters for filing:** a zero derived tax is ambiguous. It means
either a tax-exempt customer or a zero-rated sale, and you cannot tell which,
because `tax_exempt` is one of the missing columns in §2. Fixed by running the
migration, not by anything in the API.

## 6. What we will not expose

- Payment credentials or card data — the storefront never holds them.
- Admin accounts, audit log, site settings.
- Anything under `/api/admin/*`.
- Customer records in bulk. §3 returns ids and totals; a per-customer read would
  need its own justification, the same standard you applied to `credit_limit`.

## 7. Auth, if any of this is built

- A storefront-issued key held by the ERP, read-only, separate from the key we
  use to call you. Neither should be able to stand in for the other.
- Rate-limited, and **every call logged**: caller, timestamp, endpoint, date
  range, row count. Customer data leaving the system needs an audit trail — the
  storefront's own `audit-log.sql` is unapplied, so this would go in with it.
- Date-bounded queries only. No "give me everything".

## 8. Questions for you

1. **What is the actual finance requirement?** If it is month-end reconciliation,
   §3 covers it. If it is something else — commissions, revenue recognition,
   deferred revenue — say which, because the answer may be "the ERP already has
   this once the push is reliable".
2. **Do you want CRM records pushed or pulled?** We think pushed, once
   `write_leads`/`write_quotes` are granted. That decision is blocked on the
   `TEST` key, same as everything else.
3. **Is the ERP the system of record for web orders?** If yes, §3 is the whole
   integration and the storefront should not be queried for order data at all.

## 9. Unchanged from previous rounds

1. **`TEST` key** — blocks order push and CRM scope.
2. **`write_products`** — still on our key, still not needed; we only read.
3. **Three storefront migrations** — ours to run, and the blocker for §2.
