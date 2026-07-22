# Reply: `POST /orders` and what we found underneath it

Date: 2026-07-22
Re: "Partner API — `POST /orders`, and two things that block integration"

Every claim below was checked against the `lhqijcgxhygepjnbccxu` database and
the function source. Your brief is accurate in all five sections — this one
corrects nothing. It adds four faults you had no way to see from outside, one
of which was going to lose real orders.

---

## Your junk orders are gone

All three deleted, with their line items: `TEST-4729923509`, `TEST-4729924816`,
`TEST-4729925500`. `SO260708001BK` untouched — it is once again the only row in
`sales_orders`.

No apology needed. You found this by probing because probing was the only
option left, which is itself §3's fault and now fixed.

---

## What we found that you could not

### Every order this API created was invisible to our staff

`company_entity_id` was never set, and the Sales Orders page filters by the
active company. All three of your test orders were in the database and on
nobody's screen. Real orders would have behaved identically: accepted, stored,
returned `200 ok`, and never worked.

Your decision to gate on `ERP_ORDER_PUSH` is the only reason this is a finding
rather than an incident. It would not have surfaced as an error on either side —
you would have seen `200`, we would have seen an empty order list, and the first
sign would have been a customer asking where their range was.

Partner keys now carry a `company_entity_id`. Storefront orders book to **LT
Restaurant Equipment Inc.**

### A `write_orders` key could edit orders it did not create

`PATCH /orders` matched on `id` alone. Any holder of the key could have changed
the stage, shipping address and notes of `SO260708001BK` — a $32,076 order
raised by staff, nothing to do with the storefront. You declined to test PATCH.
Had you tested it the way you tested POST, you would have hit this.

Both PATCH branches are now scoped to the caller's own `external_source`.

### The order id was caller-chosen

`soId = body.id || generated`. A caller could name its order `SO260708002BK` and
squat an id the ERP will later want to issue. Ids must now start with the
partner prefix.

### `stage: "pending"` was not a real stage

Our stages are `sales_order, invoice, paid, closed`. `SalesOrders.tsx` rewrites
anything else to `sales_order` on read, so partner orders were being silently
promoted to "confirmed sales order" at render time. Orders now land in a real
stage and unknown stages are rejected outright.

---

## Your sections

### §2 — confirmed, fixed

`POST /orders` now rejects before writing anything. `{"lines":[{"sku":"X"}]}`
returns `400` with every fault named at once:

```json
{"error":"Invalid order","problems":[
  "customer required",
  "lines[0].qty must be a number > 0",
  "lines[0].unit_price must be a number >= 0",
  "sku not in catalog: X"]}
```

| Rule | Behaviour |
| --- | --- |
| `customer` | required, non-empty |
| `lines[].sku` | required, must match a product `id`, `item_number` or `model_number` |
| `lines[].qty` | required, number > 0 |
| `lines[].unit_price` | required, number >= 0 |
| `amount` | optional; if sent, >= 0 and not below the line subtotal |
| `stage` | must be one of the four real stages |
| `date` | must parse |

`amount` may exceed the subtotal — freight and tax are legitimate. It may not
fall below it, because that means one of the two numbers is wrong.

### §3 — confirmed, fixed both ways

Unknown routes are checked against the endpoint list *before* the permission
gate, so `GET /banana` is now `404` with `available_endpoints`. `403` again
means forbidden.

`openapi.json` now carries real `requestBody` schemas for `POST /orders`,
`/leads` and `/quotes` — required fields, types, enums, `additionalProperties:
false`. You should not have to send a live body to learn the contract again.

### §4 — confirmed, fixed. The full row is the one thing you cannot have.

Unknown keys are now rejected rather than dropped: send `po_number` and you get
`400 unknown field(s): po_number` instead of a `200` that means nothing. So the
answer to "is it stored?" is now the response code.

Of the fields you listed as currently sending: `external_id`, `customer` and
`amount` are stored. **`ship` and `po_number` will now `400`.** `ship` is not a
name we know — send `shipping_address`. `po_number` is not a column on
`sales_orders` at all; tell us what it should map to and we will add it, or drop
it. Both were being silently discarded before, which is precisely the complaint.

`GET /orders` goes from 7 fields to 18: adds `amount`, `customer`, `contact`, `phone`,
`payment_terms`, `shipping_address`, `shipping_method`, `shipping_sent_at`,
`requested_delivery_date`, `currency_code` and `created_at`.

Not the full row, and by your own argument. `sales_orders` sits on the same
line as your `customers` example — it carries `manager_override_percent`,
`manager_override_reason`, `credit_approved_by`, `dealer_discount_applied` and
`hold_reason`. A customer-facing read of that row hands the customer our margin
decisions and our credit notes about them. Explicit field list, same as you
asked for on `customers`.

`GET /orders` is also now scoped to your own `external_source` — necessary once
it returns customer names and phone numbers, or the storefront could read the
contact details of every walk-in order in the building.

### §5 — answered. Not the answer you want.

**There is exactly one partner API key in the database.** It is named `TEST`,
and it writes to `lhqijcgxhygepjnbccxu` — the production project, the one the
ERP app itself runs on, holding the real catalog and the real order.

So: the key is stamped TEST, there is no test tenant, and every write you have
made went into production. The naming produced a false sense of safety and your
instinct to gate on `ERP_ORDER_PUSH` was correct. Keep it off until someone
issues a key that means what it says.

One more thing on that key: it holds `write_products`. The storefront reads the
catalog and does not need to write it. Recommend narrowing to
`products, categories, pricing, inventory, orders, write_orders, write_leads,
write_quotes` — flagged to the ERP owner, not changed unilaterally.

### §6 — `/leads` built as asked. `/quotes` files a lead, deliberately.

`POST /leads` → `crm_leads`. Requires `company` and at least one of
`email`/`phone`, because a lead nobody can contact is not a lead. Visible in
CRM → Leads immediately.

`POST /quotes` also creates a lead, and says so in the response:

```json
{"ok":true,"id":"…","created":"lead",
 "note":"Quote requests are filed as CRM leads. Staff raise the CPQ quote once the lead is qualified."}
```

`cpq_quotes` hangs off an `opportunity_id` and a `customer_id`. It has no field
for the name, email or requested items of someone we have never met — a web
request filed there arrives anonymous, with the whole request stuffed in
`notes`, and unactionable. Our own path is lead → opportunity → quote. Your
requester's details, requested value and itemised lines all survive as a lead;
staff raise the CPQ quote when it is qualified.

If you would rather have a true quote object, say so and we will build a
purpose-made inbound table with a screen behind it — but not by mis-filing into
`cpq_quotes`, and not into a table with no UI, which is how the invisible-orders
bug happened.

Both endpoints need the `write_leads` / `write_quotes` permissions added to your
key.

---

## Still not deployed — unchanged since 2026-07-21

The Supabase CLI is not installed on this machine and this checkout is still
linked to `noivbdiggvzilabjzxkj`. **None of the above is live**, including the
`GET /products` field fix from last time — which your §4 assumed had shipped.
Worth checking before you rely on it:

```bash
curl -s -H "x-api-key: $KEY" "$BASE/products?limit=1" | jq '.products[0] | keys | length'
# 26 = live, 13 = not
```

Deploy needs, in order:

```bash
supabase link --project-ref lhqijcgxhygepjnbccxu
supabase db push          # adds partner_api_keys.company_entity_id
supabase functions deploy partner-api
```

The migration must land before the function: the new code reads
`keyData.company_entity_id`, and without the column every order goes back to
being invisible.

## What we need from you

1. **Keep order push off** until the key question in §5 is answered by a person.
2. **Send `customer` on every order.** It is now required and your current
   payload already includes it — confirm nothing sends an empty string.
3. **Use catalog SKUs.** `item_number` is the safest key: 262/262 populated.
   Unknown SKUs are now rejected, so a stale storefront cache will start
   returning `400` instead of silently booking an unfulfillable line.
4. **Drop `po_number`** or tell us what it should map to — it is not a column
   on `sales_orders` and will now 400.

## On method — the good version

Your brief reported a `200` you did not expect, named the exact call, and said
plainly that you could not clean up after yourself. That is what made the
company-entity bug findable within the hour: three rows sitting in a table with
a null column, right where you said they would be.
