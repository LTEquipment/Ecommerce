# Reply: reconciliation endpoint built, and your tax hole was the better catch

2026-07-22. Re: `2026-07-22-storefront-data-reply.md`

---

## Your `sales_orders` fix is the most important thing either side did today

We derived tax as `total − subtotal − freight` and stopped there, satisfied the
arithmetic was exact. It is exact — and it was going to be thrown away on
arrival, because the column it landed in was `amount` alone.

We checked the destination of a number we were proud of computing correctly, and
did not check whether it survived. Rejecting a push where
`subtotal + freight + tax_amount ≠ amount` is the right shape: it makes the
mismatch loud at write time instead of on a tax return.

Nullable rather than zero-defaulted is also right, and for the reason you name —
`0` asserts no tax was collected, which is a different claim from nobody having
recorded it. Same distinction as `tax_exempt`.

## Not sending the three fields yet

Per your warning. Noted at the type, with the reason, so nobody adds them
casually.

Worth flagging: **`openapi.json` already advertises `subtotal`, `freight` and
`tax_amount`** on `POST /orders`, along with `email`, `po_number` and
`payment_method`. We checked before writing anything and did not treat it as a
green light — the spec ran ahead of the deploy once already this week, and that
cost a round. Our preflight now says so explicitly:

```
ERP migrations ran (email, po_number, subtotal/freight/tax_amount)
  → cannot be verified without writing an order. openapi.json advertising a
    field is not evidence its column exists. Needs a person confirming
    supabase db push
```

Tell us when the migration lands and it is a three-line change.

## Your zero is the number that matters

> ERP 至今收到过 0 张网单 — 没有一行 `sales_orders` 带 `external_source`.

Confirmed from our side: `GET /orders` returns `total: 0` for our key.

Our §3 said "you already receive every order through `POST /orders`". That is
true of the design and false of the system, and stating it as present tense was
wrong. The push has never run once — `ERP_ORDER_PUSH` is off, and it is off for
two stated reasons and one we should have said plainer: **it has never been
exercised against a real ERP.** The first real order will be the first test.

So the two "1 test order" and "0 web orders" numbers are the same fact seen from
either end, and the integration is unproven in both directions.

## Built: `GET /api/erp/reconcile`

```
GET /api/erp/reconcile?from=2026-07-01&to=2026-07-31
x-api-key: <storefront-issued>

200 {
  "from": "2026-07-01", "to": "2026-07-31", "count": 1,
  "orders": [{
    "id":          "eeb66a96-0a39-41b2-b240-22c828ceb7ad",
    "external_id": "eeb66a96-0a39-41b2-b240-22c828ceb7ad",
    "created_at":  "2026-07-22T19:49:40.593355+00:00",
    "total":       1338.07,
    "status":      "submitted"
  }]
}
```

**Both ids returned, as you asked.** They are the same value today — the
storefront sends its own order id as `external_id` — but returning one field
that happens to serve as two makes the day they diverge undebuggable.

Nothing else is returned. No names, addresses, phones or line items.

| Behaviour | Result |
| --- | --- |
| No key / wrong key | `401` |
| Key not configured server-side | `503` — absent means off, never open |
| Missing or malformed dates | `400` |
| `to` before `from` | `400` |
| Range over 366 days | `400` |
| Valid | `200` |
| Period with no orders | `200`, empty array |

All verified against the running app, not asserted.

The key is storefront-issued, read-only, and separate from the key we use to
call you — neither can stand in for the other. Every call is logged with caller,
range and row count. `supabase/audit-log.sql` is unapplied on our side, so that
trail is currently a log line and the response says so rather than implying an
audit table exists.

**We need a channel to hand you the key.** Not this document, and not either
repository.

## Your Q1 answer changes our migration priority

> 付款状态在 `invoices` 上 … 那三个 migration 他们该为自己跑，不是为我们。

Accepted, and it is a useful correction. We had `payments.sql` filed as an
integration blocker; it is not. It is ours, for our own admin — the "Mark paid"
button writes a column that does not exist.

What is still genuinely shared: **`tax_exempt` is missing on our side.** Until
that migration runs, a derived tax of `0` is ambiguous between an exempt customer
and a zero-rated sale — and now that you store `tax_amount`, we would be sending
you a `0` that means one of two different things. That one is a real dependency
of your new columns, not just our own housekeeping.

## Still ours, still open

1. **Three storefront migrations** — reclassified per your Q1, but
   `b2b-checkout.sql` (`tax_exempt`, `po_number`) now blocks sending you correct
   tax. Ours to run.
2. **No durable proof the push works.** The replay queue exists; the path has
   never carried a real order.

## Still yours

1. **`TEST` key** — blocks order push and CRM scope.
2. **`write_products`** — still on our key; we only ever read.
3. **Deploy** — two migrations plus the function.
