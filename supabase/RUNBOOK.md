# Migration runbook — 2026-07-22

## ⚠ Storefront project only — never the ERP

Paste into the Supabase SQL editor for **`mrfcfjsmossulfrbwoml`** (the
storefront). **Not `lhqijcgxhygepjnbccxu` (the ERP).**

This is not a formality. The ERP has its own table called `orders`, with
entirely different columns:

```
amount, created_at, customer, date, id, items, payment_method,
products, shipping_address, status, updated_at
```

So `alter table orders add column if not exists ...` would **succeed** there,
silently grafting storefront columns onto the ERP's order table. Worse,
`payments.sql` contains:

```sql
update orders set payment_method = coalesce(payment_method, 'card')
  where payment_method is null;
```

The ERP's `orders` table has a `payment_method` column. Run against the ERP,
that statement rewrites real order data. The following statement references
`total`, which the ERP's table lacks, so the script would then abort — after the
damage.

Check the project name in the Supabase header before pasting anything.

**The ERP's own pending migration is not in this repository and is not ours to
run.** It is `supabase db push` from the ERP checkout, by the ERP team, adding
`partner_api_keys.company_entity_id` and `sales_orders.email / po_number /
subtotal / freight / tax_amount`.

---

Every file below is idempotent (`add column if not exists`, `create ... if not
exists`), so re-running one is safe and a half-finished run can simply be redone.

Run them **one file at a time** and read the result before moving on. Do not
paste a concatenation of all four — if one fails you want to know which.

**Do not copy SQL out of this document.** Open the actual file and paste its
whole contents; that way there is one source of truth and no transcription
error.

---

## Part 1 — the four that matter (run in this order)

### 1. `guest-orders.sql`

Adds `guest_email`, `guest_name`, `guest_phone` to `orders`.

**Unblocks:** guest orders being findable. Right now a guest checks out
successfully and then cannot look their order up at `/track`, because the email
they typed was never stored. This is the one with a customer on the other end of
it.

### 2. `b2b-checkout.sql`

Adds `po_number`, `tax_exempt`, `resale_cert` to `orders`.

**Unblocks:** two things.

- The customer's PO number reaches the ERP's paperwork instead of being dropped.
- **Sales tax stops being ambiguous.** The storefront stores `subtotal`,
  `freight` and `total`; tax is derived as `total − subtotal − freight`. A
  derived `0` currently means either "tax-exempt customer" or "no tax charged"
  and nothing distinguishes them. The ERP now stores `tax_amount` on its side,
  so without this column we would be sending them a `0` that means one of two
  different things.

### 3. `payments.sql`

Adds `payment_method`, `payment_status`, `paid_at`, `amount_paid`,
`payment_ref`, plus a `payments` ledger table.

**Unblocks:** the admin "Mark paid" button, which currently writes a column that
does not exist and errors.

**Two things to expect, both intended:**

- It back-fills existing orders — `shipped`/`delivered` become `paid`,
  `cancelled` becomes `failed`, everything else stays `pending`. With one order
  in the table (a test order, see Part 3) this does effectively nothing.
- It references `public.is_admin()`. That function exists — three
  already-applied migrations use it — so this will not fail.

### 4. `erp-order-queue.sql`

Adds `erp_customer`, `erp_status`, `erp_order_id`, `erp_error`, `erp_attempts`,
`erp_last_try_at` to `orders`.

**Run this after 1 and 2.** Not for the DDL — column order does not matter — but
because the replay sweep reads `po_number` and `guest_email` when rebuilding an
order, and a replay without them would send the ERP a different order than the
first attempt did.

**Unblocks:** the ERP replay queue. It is built and currently inert: a push lost
to an outage has nowhere to record itself, so nobody finds out. This is a
prerequisite for turning `ERP_ORDER_PUSH` on.

---

## Part 2 — verify

Paste this after all four. Every row should read `ok`.

```sql
select
  c.expected as needed_column,
  case when x.column_name is null then 'MISSING' else 'ok' end as state
from (values
  ('guest_email'), ('guest_name'), ('guest_phone'),
  ('po_number'), ('tax_exempt'), ('resale_cert'),
  ('payment_method'), ('payment_status'), ('paid_at'), ('amount_paid'),
  ('erp_customer'), ('erp_status'), ('erp_order_id'), ('erp_attempts')
) as c(expected)
left join information_schema.columns x
  on x.table_schema = 'public'
 and x.table_name   = 'orders'
 and x.column_name  = c.expected
order by state, needed_column;
```

Then confirm from the app side — place a test order and check the server log. It
currently prints:

```
[orders] <id> saved without: amount_paid, guest_email, guest_name, guest_phone,
paid_at, payment_method, payment_status, po_number, resale_cert, tax_exempt
— run the migrations
```

After a successful run that line should not appear at all. If it still lists
columns, one of the four did not take.

---

## Part 3 — while you are in there

**Delete the test order.** It is not a real sale and will otherwise be counted
in any revenue figure:

```sql
delete from orders where id = 'eeb66a96-0a39-41b2-b240-22c828ceb7ad';
```

`order_items` has `on delete cascade`, so its line item goes with it.

---

## Part 4 — the other seven, and why they are not urgent

These are pending but nothing is bleeding. Each degrades gracefully — the
feature is simply dark.

| File | What stays off until it runs |
| --- | --- |
| `admin-catalog.sql` | Stock quantities, low-stock alerts |
| `audit-log.sql` | Audit panel is permanently empty; every `logAudit()` is a no-op. **Also the audit trail for the ERP reconciliation endpoint** — that currently logs to console only |
| `product-reviews.sql` | Reviews; PDP shows "No reviews yet" |
| `product-docs.sql` | Spec-sheet downloads |
| `saved-lists.sql` | Account project lists |
| `quote-convert-idempotency.sql` | A double-click on "Create order from quote" can duplicate the order |
| `account-deletion.sql` | Self-service deletion falls back to an email-us message |

`quote-convert-idempotency.sql` is the one to do next after Part 1 — it is a
correctness bug rather than a missing feature, even if a narrow one.

---

## What this does *not* fix

Running all of Part 1 does not turn on the ERP order push. That still needs:

1. Someone confirming the ERP key reporting `"partner": "TEST"` is the right key
   for real orders.
2. The ERP's own migration (`sales_orders.email`, `po_number`, `subtotal`,
   `freight`, `tax_amount`) plus their function deploy.
3. `ERP_ORDER_PUSH=on`.

The push has never carried a real order in either direction. The first one will
be the first test.
