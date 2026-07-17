# Database migrations

The app ships its schema as `.sql` files in this folder. They are **not applied
automatically** — run them in the Supabase SQL editor
(Dashboard → SQL → New query → paste → Run). Every feature degrades gracefully
until its migration is applied (the UI renders but writes no-op / lists stay
empty), so an un-run file never crashes the site.

Almost all files are **idempotent** (`create table if not exists`,
`drop policy if exists … create policy …`, guarded `alter … add column`), so
re-running one is safe. Run `schema.sql` first; the delta files can then be run
in any order.

## 1. Base schema (run first)

- [ ] **`schema.sql`** — full base: products, categories, admins, customers,
  orders + order_items, contact_messages, subscribers, the `is_admin()` helper
  and their RLS. Everything else builds on these tables.

## 2. Catalog, admin & platform

- [ ] `admin-catalog.sql` — admin catalog + inventory management.
- [ ] `product-docs.sql` — downloadable product documents/spec sheets.
- [ ] `site-settings.sql` — key/value store for admin feature flags (e.g. the
  investor-relations toggle, `dealer_discount_pct`).
- [ ] `audit-log.sql` — admin action audit trail.

## 3. Orders & checkout

- [ ] `orders-hardening.sql` — server-authoritative pricing (closes client-side
  price/payment tampering). **Security — apply.**
- [ ] `order-shipping.sql` — ship-to address columns on orders.
- [ ] `order-fulfillment.sql` — carrier / tracking_number / shipped_at.
- [ ] `guest-orders.sql` — guest checkout (guest_email/name/phone) + `/track` lookup.
- [ ] `b2b-checkout.sql` — PO number + tax-exemption / resale-cert fields.
- [ ] `payments.sql` — payment_status/amount_paid/paid_at (Stripe-ready).

## 4. Reviews, Q&A & quotes

- [ ] `product-reviews.sql` — verified-purchaser product reviews.
- [ ] `product-qa.sql` — pre-purchase product questions & staff answers.
- [ ] `quote-requests.sql` — Request-a-Quote (RFQ) cart + admin Quotes tab.
- [ ] `quote-convert-idempotency.sql` — `converted_order_id` on quote_requests
  so RFQ→order conversion can't duplicate.

## 5. Customer account & after-sales

- [ ] `customer-addresses.sql` — saved address book (own-row RLS).
- [ ] `saved-lists.sql` — account-synced project lists.
- [ ] `warranty-registrations.sql` — register purchased equipment.
- [ ] `after-sales.sql` — warranty_claims + service_tickets.
- [ ] `stock-notifications.sql` — back-in-stock "Notify me" capture.
- [ ] `contact-triage.sql` — `handled` flag on contact_messages.
- [ ] `account-deletion.sql` — CCPA/GDPR "Request account deletion" queue
  (own-row RLS; admin queue on the Customers tab). Until run, the account
  button falls back to an email prompt.

## 6. Security hardening

- [ ] `dealer-app-metadata.sql` — one-time backfill of approved dealers into
  `app_metadata` (dealer-entitlement hardening).

---

**No migration needed:** the freight/tax config (uses `site_settings`), the
"Download your data" export and the email-notification preferences (both read
existing tables) work as soon as the code is deployed.
