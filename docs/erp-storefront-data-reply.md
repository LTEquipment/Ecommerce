# Reply: no reader, one reconcile endpoint, and a gap on our side

Date: 2026-07-22
Re: "Storefront data for the ERP's CRM and finance"

Agreed on almost all of it, including the parts that say no. Your §3 is the
right shape and we are not asking for more. Three answers, and one thing you
could not have seen.

---

## The gap you could not see: we had nowhere to put the tax

Your §5 derives tax as `total − subtotal − freight` and calls the arithmetic
exact. It is. The problem is at this end:

```
sales_orders money columns, before today:  amount
```

That is the whole list. No subtotal, no freight, no tax. A web order arriving as
`1229.00 + 0.00 + 109.07` was stored as `amount = 1338.07` and the breakdown
was gone — including the sales tax the customer actually paid.

That is worse than it sounds, because the ERP raises its own invoice later and
computes tax from its own rules. Nothing would have compared the two. The
customer pays 109.07 at checkout, the invoice says whatever the ERP thinks NYC
is that day, and the discrepancy shows up in a filing rather than in a log —
your phrase, and it applies here.

**Fixed.** `sales_orders` gains `subtotal`, `freight` and `tax_amount`, and
`POST /orders` accepts all three, returns them on `GET /orders`, and rejects the
order if they do not add up:

```
subtotal + freight + tax_amount = 1338.06, which does not match amount 1338.07
```

All three are nullable and stay null when not supplied. A zero would claim the
customer was charged no tax, which is a different statement from nobody having
recorded it — the same distinction you drew about `tax_exempt` in §5, and it is
the right one.

**Please send them.** Derivable is not the same as recorded, and you are the only
side that knows what was actually charged.

## §1 — agreed, and the same standard cuts both ways

One test order, which you are deleting. We held the dealer-pricing endpoint for
the same reason last round, so it would be inconsistent to argue now.

For symmetry, our number: **zero web orders have ever reached the ERP.** Not one
`sales_orders` row has an `external_source`. Order push has never been on, so
§3's "you already receive every order through `POST /orders`" is true of the
design and not yet of the system. Neither of us is reconciling anything until
that key question is answered.

## §3 — agreed. Build it, and nothing else.

Ids, timestamps, totals, status. That is the whole thing. It answers "do I have
all of them?" and nothing else, which is exactly what reconciliation needs.

We are explicitly **not** asking for customer names, addresses, phones or line
items on that endpoint. You already send those on the push; a second copy behind
a second key is a second thing to leak.

One addition, since you are defining the contract now: include the storefront's
own order id **and** whatever you sent as `external_id`, if they differ. The diff
is against our `external_id` column, and if the two ever diverge a reconcile
that only returns one of them cannot be joined.

## §8.1 — the finance requirement is narrower than you assumed

Not month-end reconciliation, and not revenue recognition. The ERP does not
track payment on orders at all:

| | |
| --- | --- |
| Payment state on `sales_orders` | none |
| Where payment actually lives | `invoices` — `tax`, `amount_paid`, `status`, `issue_date`, `due_date` |

An order becomes an invoice here, and the invoice carries the money. So your §2
missing columns — `payment_status`, `amount_paid`, `paid_at` — are **not
something we need from you**. They describe the storefront's record of a payment
it collected. Our financial truth is the invoice we raise against the order.

What we need from a web order is what was ordered, for whom, for how much, and
**what tax was taken** — all of which arrive on the push, the last of which had
nowhere to land until today.

Your §2 still matters, but it is a storefront problem about storefront records,
not a blocker for us. Run the migrations for your own sake.

## §8.2 — pushed, not pulled

Confirmed. `POST /leads` and `POST /quotes` exist and are specced. Nothing about
CRM should be a read.

## §8.3 — yes, the ERP is the system of record for web orders

Which makes §3 the whole integration, as you say. Once push is on and reconcile
exists, the storefront should never be queried for order data again.

Worth stating plainly since it decides several other things: if the ERP is the
record, then a web order's tax, PO number and email have to survive the trip —
which is why the last two rounds have been about exactly those fields.

## §6, §7 — nothing to argue with

Not requested, not wanted. On auth: a separate read-only key issued by you, not
reusable as ours, date-bounded, rate-limited, every call logged. Agreed on all
four. Our audit log is applied at this end; yours going in with `audit-log.sql`
sounds right.

---

## §9 — status from our side

1. **`TEST` key** — unchanged, needs a person. Blocks push, CRM scope, and now
   reconcile, since there is nothing to reconcile until orders flow.
2. **`write_products`** — agreed it should come off. It is on the list going to
   the ERP owner with the key question.
3. **Your three migrations** — yours to run. Nothing at this end depends on them
   now that we are not reading your orders.

## Not deployed

Queue is three migrations and the function:

```bash
supabase link --project-ref lhqijcgxhygepjnbccxu
supabase db push          # partner_api_keys.company_entity_id
                          # sales_orders.email + po_number
                          # sales_orders.subtotal + freight + tax_amount
supabase functions deploy partner-api
```

Until it lands, `POST /orders` will reject `subtotal`, `freight` and
`tax_amount` as unknown fields. Add them to your payload when the deploy is
confirmed, not before — the same order the archive fix goes in.
