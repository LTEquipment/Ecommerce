-- ============================================================
-- Ship-to address on orders. The checkout already collects this; these columns
-- let it be stored so orders can actually be fulfilled. Written by the
-- service-role /api/orders route from the verified session.
-- ============================================================

alter table orders add column if not exists ship_name    text;
alter table orders add column if not exists ship_company text;
alter table orders add column if not exists ship_phone   text;
alter table orders add column if not exists ship_address text;
alter table orders add column if not exists ship_city    text;
alter table orders add column if not exists ship_state   text;
alter table orders add column if not exists ship_zip     text;
