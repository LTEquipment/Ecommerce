-- =====================================================================
-- L&T storefront — run this whole file in the Supabase SQL editor.
--
--   PROJECT: mrfcfjsmossulfrbwoml   (the storefront)
--   NOT:     lhqijcgxhygepjnbccxu   (the ERP — it has its own `orders`
--            table with different columns, and payments.sql below would
--            rewrite real order data there. Check the project name in the
--            Supabase header before you paste.)
--
-- GENERATED — do not edit. This is guest-orders.sql, b2b-checkout.sql, payments.sql, erp-order-queue.sql concatenated in dependency order
-- by scripts/build-runbook-sql.py. Edit those files and regenerate; anything
-- typed here is lost on the next build.
--
-- Safe to re-run: every statement is `if not exists` or an idempotent
-- update, so a partial run is fixed by running the whole thing again.
-- =====================================================================


-- ==================== guest-orders.sql ====================

-- Guest checkout: persist orders placed without an account.
-- orders.customer_id is already nullable (references customers on delete set null),
-- so a guest order simply has a null customer_id. We add the guest's contact so
-- the order is fulfillable and can be looked up later by order # + email.
--
-- Guest reads never happen through RLS (a guest has no session) — the
-- /api/orders/lookup route uses the service-role key and verifies the supplied
-- email against guest_email (or the owning customer's email) before returning an
-- order. So no new RLS policy is required here.

alter table orders add column if not exists guest_email text;
alter table orders add column if not exists guest_name  text;
alter table orders add column if not exists guest_phone text;

-- Speeds up the order # + email guest lookup.
create index if not exists orders_guest_email_idx on orders (guest_email);

-- ==================== b2b-checkout.sql ====================

-- B2B checkout fields on orders: purchase-order number and tax-exemption.
-- All nullable/defaulted so existing rows and the order-creation fallback are
-- unaffected. Nothing is charged online (payment stays 'pending' and staff
-- confirm the final total), so a tax-exempt order simply carries tax = 0 and a
-- flag + resale certificate for the team to verify before payment.

alter table orders add column if not exists po_number   text;
alter table orders add column if not exists tax_exempt   boolean not null default false;
alter table orders add column if not exists resale_cert  text;

-- Dealer contract pricing is driven by a single admin-set discount in
-- site_settings ('dealer_discount_pct', default 0 = list price), applied
-- server-side to approved dealers' order/quote line items. No column needed.

-- ==================== payments.sql ====================

-- ============================================================
-- L&T storefront — payments (Stripe-ready) migration
-- Run this in the Supabase SQL editor. Safe to re-run.
-- Adds payment state to orders + a transaction ledger that the
-- Stripe webhook will populate once live keys are added.
-- ============================================================

-- ---------- Order payment state ----------
alter table orders add column if not exists payment_method text;                            -- 'card' | 'terms' | 'wire'
alter table orders add column if not exists payment_status text not null default 'pending'; -- pending | paid | refunded | partially_refunded | failed
alter table orders add column if not exists paid_at       timestamptz;
alter table orders add column if not exists amount_paid    numeric(10,2) not null default 0;
alter table orders add column if not exists payment_ref    text;                             -- Stripe PaymentIntent id (set by webhook)

-- ---------- Transaction ledger ----------
-- One row per charge / refund. Written by the Stripe webhook (service-role key).
create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid references orders(id) on delete cascade,
  provider     text not null default 'stripe',
  provider_ref text,                       -- Stripe charge / payment_intent / refund id
  method       text,                       -- card | terms | wire
  status       text not null,              -- succeeded | pending | refunded | failed
  amount       numeric(10,2) not null default 0,
  currency     text not null default 'usd',
  created_at   timestamptz not null default now()
);
create index if not exists payments_order_idx        on payments (order_id);
create index if not exists orders_payment_status_idx on orders (payment_status);

alter table payments enable row level security;
drop policy if exists "read own or admin payments" on payments;
create policy "read own or admin payments" on payments for select using (
  public.is_admin() or exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
);
-- Inserts come from the Stripe webhook via the service-role key, which bypasses RLS.

-- ---------- Backfill existing orders ----------
-- So payment analytics has realistic data from day one:
--   shipped/delivered  -> collected (card)
--   cancelled          -> failed
--   submitted/processing -> stays 'pending' (awaiting collection = correct for backlog metrics)
-- Only touches rows still at the default; edited/real payments are never overwritten.
update orders set payment_method = coalesce(payment_method, 'card') where payment_method is null;
update orders set payment_status = 'paid', paid_at = coalesce(paid_at, created_at), amount_paid = total
  where status in ('shipped', 'delivered') and payment_status = 'pending';
update orders set payment_status = 'failed'
  where status = 'cancelled' and payment_status = 'pending';

-- ---------- Realtime ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'payments'
  ) then
    execute 'alter publication supabase_realtime add table public.payments';
  end if;
end $$;

-- ==================== erp-order-queue.sql ====================

-- ============================================================
-- ERP order replay queue.
--
-- The push to the ERP is deliberately never fatal: the customer has already
-- paid by the time it runs, so an ERP outage must not fail a checkout. The
-- consequence is that a failed push is invisible — the order simply never
-- reaches the ERP and nobody finds out until someone asks where it went.
--
-- These columns make the order row its own queue entry. No separate table: the
-- thing that needs replaying IS the order, and a second table would only need
-- keeping in step with it.
--
-- Replay is driven by erp_status:
--   null      never attempted (push disabled, or the row predates this)
--   'sent'    accepted; erp_order_id holds the ERP's sales order id
--   'failed'  rejected deterministically (a 400). Needs a fix, NOT a retry.
--   'pending' the attempt was inconclusive — timeout, 5xx, network drop. Safe
--             to replay: external_id and Idempotency-Key make a repeat a no-op
--             on the ERP side rather than a duplicate order.
--
-- RUN b2b-checkout.sql AND guest-orders.sql FIRST. Neither is applied as of
-- 2026-07-22, so `orders.po_number` and `orders.guest_email` do not exist yet.
-- The replay sweep reads both to rebuild an order's payload; without them it
-- fails on the select, and a replayed order would in any case be missing the
-- customer PO and the guest contact address that the first attempt carried.
-- ============================================================

-- The resolved customer name exactly as it was sent. The checkout builds it
-- from a `company` field that is never persisted, so without this a replay
-- would silently send a different customer than the original attempt did.
alter table orders add column if not exists erp_customer     text;

alter table orders add column if not exists erp_status       text;         -- sent | failed | pending
alter table orders add column if not exists erp_order_id     text;         -- ERP sales order id, once accepted
alter table orders add column if not exists erp_error        text;         -- last failure, problems[] joined
alter table orders add column if not exists erp_attempts     integer not null default 0;
alter table orders add column if not exists erp_last_try_at  timestamptz;

-- The replay sweep only ever looks for work, so index just the rows that are
-- work. Sent and never-attempted orders are the overwhelming majority.
create index if not exists orders_erp_replay_idx
  on orders (erp_last_try_at)
  where erp_status in ('pending', 'failed');
