# Request: CRM outbound permissions + a dealer pricing lookup

2026-07-22. Three asks, in priority order. The third is the one with a live
commercial defect behind it.

Order push remains off. Nothing here depends on it.

---

## The context you should have

The storefront's admin console has tabs called Customers, Quotes, Inbox and
Service. **None of them is a CRM.** "Customers" has no customer table behind it
at all — it is computed on the fly from `orders`, `service_tickets` and
`warranty_claims`. The real customer master is yours.

We are not asking to mirror it. Everything below is either write-only, or a
named field list.

---

## 1. `write_leads` and `write_quotes` on our key

Already agreed, still not granted — re-verified today:

```bash
curl -X POST "$BASE/leads"  -H "x-api-key: $KEY" -d '{}'
# → 403 {"error":"No permission for POST leads. Need: write_leads. …"}
```

`/leads` and `/quotes` are both in `openapi.json` now, so this is a permissions
change rather than new endpoints.

What we would send, from tables we already hold:

| Storefront source | → | Endpoint |
| --- | --- | --- |
| `contact_messages` (name, email, phone, company, message) | → | `POST /leads` |
| `quote_requests` (name, company, email, phone, notes, subtotal + line items) | → | `POST /quotes` |

Understood that `POST /quotes` files a CRM lead rather than a priced CPQ quote.
The UI will say "request received — we will price this", never "quote submitted".

`quote_requests` stays our source of truth either way, so nothing is lost while
this is pending.

## 2. Not asked for, so it is not ambiguous

No read access to `customers`, `invoices`, `crm_*`, or anything else. Section 3
is a named field list, not a table read. If a customer self-service portal is
ever wanted, that is a separate conversation and should use your existing
`customer_portal_accounts`, not a second login on our side.

---

## 3. Dealer pricing — a real defect, and the reason for this document

**The storefront applies one discount to every dealer.**

`site_settings.dealer_discount_pct` is a single site-wide number, 0–90, applied
to every approved dealer at checkout and on quotes. It is the only dealer
pricing the storefront has.

Meanwhile `customers` carries `dealer_tier` and `dealer_discount_percent` **per
customer**. So a tier you set in the ERP has no effect on what that customer
pays on the website. Your largest and smallest dealers currently see the same
price online. The ERP is the master and the storefront is not listening.

### What we are asking for

A lookup keyed on email, returning **only** these fields:

| Field | Why |
| --- | --- |
| `dealer_tier` | which tier to show/label |
| `dealer_discount_percent` | the actual reason for this request |
| `credit_status` | whether to offer terms at checkout at all |
| `tax_exempt` | do not charge tax to an exempt customer |
| `st120_expiry` | an expired certificate must stop being honoured |
| `customer_type` | dealer vs. direct |

### What must not be in the response

`ein`, `ein_encrypted`, `tax_exempt_id`, `tax_exempt_id_encrypted`,
`credit_notes`, `dealer_notes`, `intel`, `notes`, `w9_url`, `st120_url`,
`total_spent`.

We are also **deliberately not asking for `credit_limit`.** `credit_status` is
enough to decide whether to offer terms; the number itself is not needed to
render a price, so it should not be on a public-facing server. If a checkout
feature later needs remaining credit, we will ask then and say why.

Note we want `tax_exempt` as a boolean but explicitly **not** `tax_exempt_id`.
Knowing *that* someone is exempt is a pricing input; their tax ID is not.

### Two things that need your decision

**Email is not obviously unique.** If two `customers` rows share an email, say
what the endpoint returns — an error, the most recent, or the one with a
`customer_type` of dealer. We would rather it error than silently pick.

**Enumeration.** A lookup keyed on email lets whoever holds the key harvest
dealer pricing address by address. Our side will only ever look up the
*authenticated* user's own email, and the key is server-side only. If you want a
second guard, rate-limiting this endpoint harder than the rest is reasonable.

### What we will do on our side

- Cache per customer for a short TTL. Pricing must not mean an ERP call per page.
- **Fail closed, not open.** If the lookup fails we fall back to today's
  site-wide value — which means once per-customer pricing is live, that site-wide
  default should be set to your *least* generous tier. Otherwise an ERP outage
  silently hands every dealer the best discount. Flagging it now because it is
  the kind of thing that gets noticed in an invoice, not in a log.

---

---

## 4. Added 2026-07-22: two catalog data problems

**`specsheet_url` is unusable.** 173 of 215 products carry one, and every value
points at `http://erp.ltusa.net/web/content/<id>` — an internal Odoo attachment
path over plain http. The host times out on http and returns 404 on https, so
these are not publicly fetchable. We are **not** syncing them; doing so would
publish 173 broken downloads. If the spec sheets should reach customers they
need to be served from somewhere public — a bucket, or a signed URL — and the
field should hold that address.

**`weight` reads as populated but is not.** All 215 rows carry `"0.0"`, which
counts as a non-empty string, so a naive coverage check reports weight as
complete on the entire catalog when exactly one product has been weighed. Same
for `width`, `depth`, `height`. We skip numeric zeros rather than printing a
zero-pound wok range on a spec table.

Also unpopulated, mapped and waiting: `btu`, `voltage`, `certification`. They
will appear on product pages the moment they are filled in — nothing further is
needed on our side.

**A unit question.** If dimensions are ever populated, say whether they are
inches or millimetres. We currently render them unitless, because a number under
the wrong unit is worse than a number with none on equipment people size gas
lines and hoods around.

## Open from previous rounds

1. `TEST` key — unchanged, needs a person.
2. Real prices for the 21 at $1.00 — with your manager.
3. Photography for the 21 L&J sinks — owed, unscheduled.
4. **21 unpriced products are still live and purchasable on the storefront.**
   Ours to clear, not yours — noted so the number is not mistaken for fixed.
