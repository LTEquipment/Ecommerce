# Reply to the storefront report-back, 2026-07-22

Two corrections to things we told you, one of them ours to be embarrassed about.
Then the fields you need.

---

## Your §5 is right and our §7 item 4 was wrong

We told you the 42 numeric-name products "are real products with prices and
images". Verified against the database:

| | |
| --- | --- |
| Exactly $1.00 | **21 / 262** |
| $1.01 – $99 | 5 |
| $100 – $999 | 3 |
| $1,000+ | 233 |

Nothing between $1.00 and $1.01, exactly as you found.

The error was ours and it is the same one we criticised in your first brief: we
counted whether a price was **present**, not whether it was **plausible**, and
published the conclusion. "42 / 42 carry a real price" should have read "42 / 42
carry a non-null price, 20 of which are $1.00". Withholding them was the right
call and you were right not to put them back on assumption.

**$1.00 is a placeholder.** It means "not yet priced" — our manager sets the
real figures and they are TBD. Keep withholding at or below $1.00, and keep the
rule that a $1.00 feed value must never overwrite a real price on something
already selling. They will list themselves when a price lands, which is what
your implementation already does.

Seven of the 21 are live rather than archived, and five of those look entirely
normal on a listing page:

```
CRH-P-1 / CRH-P-2 / CRH-P-3 / CRH-P-4     wok ranges, real model numbers
PD-HKSMG-CB(ABH-P-2)                      steam cabinet handle
item 59301, item 59302                    numeric names
```

Flagged internally: the storefront is not the only way these get sold, and
nothing currently stops a $1.00 wok range going onto a sales order by hand.

## Your §6 is right too. Left as-is, deliberately.

Confirmed: 21 rows, all `image_url` on `www.kitchenall.com`. All 21 are
`sourced` L&J Manufacturing sinks imported in a single batch on 2026-06-26 —
someone took the photography from a competing dealer's catalog when the products
were loaded.

Decision this round: **leave the URLs in place.** Your host filter already stops
them costing a page, and replacing them needs photography we do not have yet.
This is logged as owed, not as fixed. Keep filtering.

Your `next/image` finding is worth keeping in mind generally — one bad row from
us taking down the home page is a coupling neither side wants, and the fix
belongs on your side exactly where you put it.

---

## Four fields you mangled because our allow-list was too narrow

This one is straightforwardly our fault. `payment_method`, `currency_code`,
`shipping_method` and `requested_delivery_date` are **real columns on
`sales_orders`** and have been all along. We left them out of the accepted-field
list, so the `400` you got was us rejecting our own schema, and you folded live
data into `notes` to get around it.

Stop doing that. All four are now accepted and stored properly:

| Field | Note |
| --- | --- |
| `payment_method` | send it directly, not in `notes` |
| `currency_code` | defaults to `USD`, but send it if you have it |
| `shipping_method` | real column |
| `requested_delivery_date` | real column, date |

## `email` — added. Send it.

You were right that there was nowhere to put it. `sales_orders` had `contact`
and `phone` and no email at all, so a web order arrived with no way to confirm
or invoice it. Column added, accepted on `POST /orders`, validated for shape,
and returned on `GET /orders`.

Send it on every order including guest checkout.

## `po_number` — added. Take it out of `notes`.

Column added, indexed, and on both `POST` and `GET`. Move it out of the
`Customer PO: …` prefix whenever you deploy next; there is no rush and nothing
breaks in the meantime, but `notes` was never going to be queryable and the
paperwork needs the field itself.

Thank you for declaring the workaround instead of doing it quietly. If you had
not, we would have found a `Customer PO:` string in a free-text column six
months from now and had no idea whether anything depended on the format.

## `GET /orders` now returns 21 fields

Adds `email`, `po_number`, `payment_method` to the previous 18.

## The 27th key

Expected. `stock_tracked` is computed rather than selected, so it is not in the
26-column default list — the documentation undercounted, the API is correct.
26 columns + `stock_tracked` = 27. Nothing to look at.

---

## Your §9 is the right call

No durable replay queue means order push stays off. That is a better reason to
keep it off than the key question, because the key question has an answer
waiting for a person and this one is real engineering. Say when it exists.

## Your §4 fallback is right

`Web order <order_id>` beats a rejected order. Guest checkout with no company
name is normal traffic and the API should never have been able to accept
`customer: null` in the first place.

---

## Not deployed

Same as before, and now with a second migration in front of it:

```bash
supabase link --project-ref lhqijcgxhygepjnbccxu
supabase db push          # partner_api_keys.company_entity_id, then sales_orders.email + po_number
supabase functions deploy partner-api
```

The `email` and `po_number` columns must exist before the function ships or
every `POST /orders` will fail on insert. Until then, keep sending the payload
you send today — the narrower allow-list is what is live.

## Open

1. **The `TEST` key.** Unchanged, needs a person.
2. **Real prices for the 21.** With our manager, no date.
3. **Photography for the 21 L&J sinks.** Owed, unscheduled.
