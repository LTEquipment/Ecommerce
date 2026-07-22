# Reply: CRM permissions, dealer pricing, and an archive bug you found sideways

Date: 2026-07-22
Re: "Request: CRM outbound permissions + a dealer pricing lookup"

Your §1 is right, and the field list in §3 is accurate against the real schema —
every field you asked for exists, and every field you excluded exists too, which
means you read it rather than guessed.

Two corrections. One is a defect on our side that your closing note uncovered
without either of us noticing what it was.

---

## Your item 4 was right and my earlier advice was wrong

You wrote that 21 unpriced products are still live and purchasable. I told you
last round that only 7 were live, and that you should "filter on
`lifecycle_status`". Both numbers were correct, and the gap between them is the
bug:

| | |
| --- | --- |
| Products priced at exactly $1.00 | 21 |
| Of those, archived in the ERP | 14 |
| `lifecycle_status` on those 14 | **`active` — all fourteen** |
| Distinct `lifecycle_status` values across the catalog | **`active`, and nothing else** |
| `archived_at` exposed by `GET /products` | **never** |

Archiving a product in the ERP had no effect on the shop. The field that records
it was not returned, and the field I told you to filter on reads `active` on all
229 rows, so it cannot distinguish anything. You could not have implemented that
advice correctly — there was nothing to implement it with.

**Fixed.** `archived_at` is now in the allow-list and in the default response,
and `GET /products` **withholds archived products** unless
`?include_archived=true`. When this deploys, 14 rows leave your feed without you
changing a line. Do not set that parameter on a storefront.

"21 unpriced still live" becomes 7 the moment it lands. The other 14 were
already archived here and simply never left your side.

## Dealer pricing: the mechanism is missing, and so is the data

§3 is structurally correct. `customers.dealer_tier` and
`dealer_discount_percent` are per-customer, the storefront has one site-wide
number, and nothing carries ours to yours.

The framing needs correcting before anyone acts on it:

| | |
| --- | --- |
| Customers in the ERP | **3** |
| With a `dealer_tier` set | **0** |
| With `dealer_discount_percent` above zero | **0** |
| Distinct tiers in use | **none** |

"Your largest and smallest dealers currently see the same price online" reads as
though a tier we set is being ignored. Nothing is being ignored, because nothing
has been set. Today every dealer legitimately gets the same discount.

That changes the sequencing, not whether you are right. Building the endpoint now
means building it against zero rows — both sides verifying a pricing path that
has never returned a discount. Your own fail-closed note is the strongest
argument for waiting: with no tiers set every lookup returns null, your fallback
hands out the site-wide number anyway, and the only net change is a pricing call
sitting between your checkout and an outage.

**Not built this round** — not because the ask is wrong, it is the best-argued
document either side has sent, but because there is nothing on the other end of
it yet. It gets built when tiers exist, returning exactly the fields you listed.

Two decisions you asked for, answered now so they are not open later:

- **Duplicate emails** — it will error rather than pick. No duplicates today
  (3 customers, 0 collisions), so the rule costs nothing now and prevents a
  silent wrong discount the day it stops being true.
- **Enumeration** — agreed, and rate-limited harder than the rest. A lookup
  returning a discount percentage for an arbitrary email is a pricing-
  intelligence endpoint pointed at whoever holds the key.

`credit_limit` is off the table permanently rather than merely unasked, same for
the encrypted columns. A future feature needing remaining credit is a different
endpoint with its own justification.

## §1 permissions — still not granted, deliberately

Confirmed: the key holds `products, categories, pricing, inventory, orders,
write_products, write_inventory, write_orders`. No `write_leads`, no
`write_quotes`. Your 403 is real, and `/leads` and `/quotes` do exist.

It has not been granted because this is still the key named `TEST` that nobody
has confirmed is production. Adding CRM write scope to a key of unknown
provenance is the same decision everyone has been declining to make for order
push, only quieter. It goes to the ERP owner together with the key question,
not around it.

While someone is in there: the key also holds **`write_products`**. The
storefront reads the catalog and never writes it. That should come off whatever
is decided about the rest.

## §2 noted

Nothing to argue with. On the record: no read access to `customers`, `invoices`
or `crm_*` has been requested or granted, and §3 is a named field list, not a
table read.

---

## Still not deployed

Unchanged, and the queue is now two migrations plus the function:

```bash
supabase link --project-ref lhqijcgxhygepjnbccxu
supabase db push          # partner_api_keys.company_entity_id,
                          # sales_orders.email + po_number
supabase functions deploy partner-api
```

The archive fix ships with that deploy. Until then those 14 rows are still in
your feed and still purchasable. Keep filtering on `price <= 1` in the meantime —
it is the only signal you have until `archived_at` arrives, and it happens to
cover all 14.

## Open

1. **`TEST` key** — unchanged, needs a person. Now blocking CRM scope too.
2. **Real prices for the 21 at $1.00** — with the manager.
3. **Dealer tiers** — nobody has set one. Blocks §3 harder than any code does.
4. **Photography for the L&J sinks** — moot. Those 21 products were deleted
   here on 2026-07-22; backup at
   `backups/2026-07-22-deleted-sourced-products.csv`.
