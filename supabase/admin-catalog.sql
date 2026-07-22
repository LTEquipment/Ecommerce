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

-- Does anyone actually count this product? Carried from the ERP, which
-- distinguishes "not tracked" from "none left" — a distinction that is lost the
-- moment both are stored as the number 0.
--
-- Without it, every product sits at stock_qty 0 and the admin flags all 215 as
-- low stock, which is noise nobody reads. With it, the alert applies to the
-- handful the ERP is really counting (2 today) and stays meaningful.
--
-- Defaults false: a product nobody has told us about is not being counted.
alter table products add column if not exists stock_tracked boolean not null default false;

-- NO SEED. This file used to set stock_qty = 24 on every in-stock product so
-- the admin inventory screen would not open full of zeros. That was written
-- when the catalog was 37 demo products.
--
-- The catalog now comes from the ERP, and running that seed today would assert
-- 24 units on hand for 208 real products that nobody has counted — the ERP
-- reports stock_tracked: false for 213 of them, meaning "not counted", not
-- "none". An invented quantity is indistinguishable from a real one once it is
-- in the column, and it would drive low-stock alerts and "in stock" badges.
--
-- Same failure as the ERP's $1.00 price and its "0.0" weights: a placeholder
-- that reads as a fact. Inventory starts at 0 and becomes real when someone
-- counts, or when the ERP starts tracking and the sync carries it.

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
