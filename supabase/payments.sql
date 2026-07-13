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
