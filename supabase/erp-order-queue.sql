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
