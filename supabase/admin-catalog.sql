-- ============================================================
-- L&T storefront — admin catalog + inventory migration
-- Run this in the Supabase SQL editor. Safe to re-run.
-- Adds real inventory quantities and the product-image bucket
-- that the admin console's product manager writes to.
-- ============================================================

-- ---------- Inventory ----------
-- Real on-hand quantity + a per-product low-stock threshold.
-- The existing `stock` ('in' | 'back') stays for the storefront badge;
-- the admin editor keeps the two in sync.
alter table products add column if not exists stock_qty int  not null default 0;
alter table products add column if not exists low_stock int  not null default 5;

-- One-time seed so inventory isn't all zero on first load. Only touches rows
-- still at the default 0 — edited quantities are never overwritten on re-run.
update products set stock_qty = 24 where stock = 'in'  and stock_qty = 0;
update products set stock_qty = 0  where stock = 'back';

-- ---------- Product image storage ----------
-- Public bucket the admin uploads product photos to (writes go through the
-- service-role key server-side; reads are public for the storefront).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Public read for product photos.
drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');

-- Admins may manage product photos from the browser too (uploads normally use
-- the service key, which bypasses RLS — this is a belt-and-suspenders grant).
drop policy if exists "admins manage product images" on storage.objects;
create policy "admins manage product images" on storage.objects
  for all using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

-- Products are already in the supabase_realtime publication (see schema.sql),
-- so INSERT/UPDATE/DELETE already broadcast to open storefront tabs.
