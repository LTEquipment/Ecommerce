-- =====================================================================
-- L&T storefront — run this whole file in the Supabase SQL editor.
--
--   PROJECT: mrfcfjsmossulfrbwoml   (the storefront)
--   NOT:     lhqijcgxhygepjnbccxu   (the ERP — it has its own `orders` and
--            `products` tables with different columns, so these statements
--            would succeed there and graft storefront columns onto real ERP
--            data. Check the project name in the Supabase header first.)
--
-- GENERATED — do not edit. This is audit-log.sql, quote-convert-idempotency.sql, admin-catalog.sql, product-docs.sql, product-reviews.sql, saved-lists.sql, account-deletion.sql concatenated in dependency order
-- by scripts/build-runbook-sql.py. Edit those files and regenerate; anything
-- typed here is lost on the next build.
--
-- Safe to re-run: every statement is `if not exists` or an idempotent
-- update, so a partial run is fixed by running the whole thing again.
-- =====================================================================


-- ==================== audit-log.sql ====================

-- ============================================================
-- Audit log — run once in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste → Run). Records every
-- admin action (product edits, order/claim/ticket status changes,
-- dealer approvals, admin grants). Admin-only read + insert.
-- ============================================================
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null,   -- e.g. 'product.update', 'order.status', 'dealer.approve', 'admin.grant'
  target      text,            -- what was acted on (sku / order id / email)
  detail      text,            -- human-readable summary
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on audit_log (created_at desc);

alter table audit_log enable row level security;
drop policy if exists "admins read audit" on audit_log;
create policy "admins read audit" on audit_log for select using (public.is_admin());
drop policy if exists "admins write audit" on audit_log;
create policy "admins write audit" on audit_log for insert with check (public.is_admin());

-- live updates (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'audit_log'
  ) then
    alter publication supabase_realtime add table public.audit_log;
  end if;
end $$;

-- ==================== quote-convert-idempotency.sql ====================

-- Idempotent RFQ→order conversion. Records which order a quote was converted
-- into so a second "Create order from quote" click (reload, second admin, stale
-- list) returns the existing order instead of creating a duplicate. Nullable, so
-- existing rows and the convert route's fallback are unaffected until this runs.
alter table quote_requests add column if not exists converted_order_id uuid references orders(id) on delete set null;

-- ==================== admin-catalog.sql ====================

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

-- ==================== product-docs.sql ====================

-- ============================================================
-- L&T storefront — product documents migration
-- Run this in the Supabase SQL editor. Safe to re-run.
-- Adds admin-managed downloadable documents per product
-- (spec sheets, manuals, warranty, elevation charts, brochures…).
-- ============================================================

-- Array of { "label": text, "url": text } objects.
alter table products add column if not exists documents jsonb not null default '[]';

-- Public bucket the admin uploads product PDFs/documents to (reads are public).
insert into storage.buckets (id, name, public)
values ('product-docs', 'product-docs', true)
on conflict (id) do update set public = true;

drop policy if exists "product docs public read" on storage.objects;
create policy "product docs public read" on storage.objects
  for select using (bucket_id = 'product-docs');

drop policy if exists "admins manage product docs" on storage.objects;
create policy "admins manage product docs" on storage.objects
  for all using (bucket_id = 'product-docs' and public.is_admin())
  with check (bucket_id = 'product-docs' and public.is_admin());

-- ==================== product-reviews.sql ====================

-- ============================================================
-- Product reviews — real, verified-purchaser reviews.
--
-- Model: a customer who actually ordered a product (matched by order_items.sku)
-- may leave one review per product. Reviews AUTO-PUBLISH (status='published' on
-- insert); admins moderate after the fact by flipping status to 'hidden'.
--
-- All writes go through the service-role server route (app/api/reviews/route.ts),
-- which enforces the verified-purchase check. There is NO client INSERT/UPDATE/
-- DELETE policy — same hardening posture as orders/order_items.
-- ============================================================

create table if not exists product_reviews (
  id           uuid primary key default gen_random_uuid(),
  product_slug text not null,
  user_id      uuid not null references auth.users(id) on delete cascade,
  rating       int  not null check (rating between 1 and 5),
  title        text,
  body         text not null,
  author_name  text not null default 'Verified buyer',
  verified     boolean not null default true,
  status       text not null default 'published', -- published | hidden
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (product_slug, user_id)   -- one review per buyer per product
);

create index if not exists product_reviews_pub_idx
  on product_reviews (product_slug) where status = 'published';

alter table product_reviews enable row level security;

-- Read: the public sees PUBLISHED reviews only; a user always sees their own
-- (even if hidden); admins see everything.
drop policy if exists "reviews public read" on product_reviews;
create policy "reviews public read" on product_reviews for select
  using (status = 'published' or auth.uid() = user_id or public.is_admin());

-- Write: no anon/authenticated INSERT/UPDATE/DELETE policy. Reviews are written
-- ONLY by the service-role API route after it verifies the purchase. Admins may
-- moderate (hide/unhide/delete) directly.
drop policy if exists "admins moderate reviews" on product_reviews;
create policy "admins moderate reviews" on product_reviews for all
  using (public.is_admin()) with check (public.is_admin());

-- Aggregate stats for card ratings + SEO aggregateRating. security_invoker=on so
-- the querying role's RLS on product_reviews applies (anon → published rows only).
drop view if exists product_review_stats;
create view product_review_stats with (security_invoker = on) as
  select product_slug,
         round(avg(rating)::numeric, 2) as avg_rating,
         count(*)::int                  as review_count
  from product_reviews
  where status = 'published'
  group by product_slug;

grant select on product_review_stats to anon, authenticated;

-- ==================== saved-lists.sql ====================

-- ============================================================
-- Account-synced named lists ("project lists") — e.g. one per location a buyer
-- is equipping. Distinct from the ephemeral localStorage wishlist: persisted,
-- multiple, cross-device. Own-row RLS.
-- ============================================================

create table if not exists saved_lists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists saved_list_items (
  id         uuid primary key default gen_random_uuid(),
  list_id    uuid not null references saved_lists(id) on delete cascade,
  sku        text not null,
  created_at timestamptz not null default now(),
  unique (list_id, sku)
);

create index if not exists saved_lists_user_idx on saved_lists (user_id);
create index if not exists saved_list_items_list_idx on saved_list_items (list_id);

alter table saved_lists enable row level security;
alter table saved_list_items enable row level security;

drop policy if exists "own lists" on saved_lists;
create policy "own lists" on saved_lists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Items are reachable only through a list the user owns.
drop policy if exists "own list items" on saved_list_items;
create policy "own list items" on saved_list_items for all
  using (exists (select 1 from saved_lists l where l.id = list_id and l.user_id = auth.uid()))
  with check (exists (select 1 from saved_lists l where l.id = list_id and l.user_id = auth.uid()));

-- ==================== account-deletion.sql ====================

-- ============================================================
-- Account deletion requests — run this once in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste → Run).
--
-- Records a customer's request to have their account deleted. This is a
-- REQUEST queue, not an automatic delete: staff review and process each one
-- (some records — paid orders, invoices — are retained for legal/tax reasons).
-- ============================================================

create table if not exists account_deletion_requests (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  email        text,
  reason       text,
  status       text not null default 'pending',  -- pending | processing | completed | cancelled
  created_at   timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id),
  note         text
);

-- At most one OPEN request per user (a cancelled/completed one doesn't block a new one).
create unique index if not exists adr_one_open_per_user
  on account_deletion_requests (user_id)
  where status in ('pending', 'processing');

alter table account_deletion_requests enable row level security;

-- Users read their own request; admins read all.
drop policy if exists "own deletion request read" on account_deletion_requests;
create policy "own deletion request read" on account_deletion_requests
  for select using (auth.uid() = user_id or public.is_admin());

-- Users may create a request for themselves only.
drop policy if exists "create own deletion request" on account_deletion_requests;
create policy "create own deletion request" on account_deletion_requests
  for insert with check (auth.uid() = user_id);

-- Only admins change status (users cancel via the server route, which verifies
-- ownership with the service role — so users can't set arbitrary states here).
drop policy if exists "admins update deletion requests" on account_deletion_requests;
create policy "admins update deletion requests" on account_deletion_requests
  for update using (public.is_admin());

-- Live updates for the admin queue (idempotent — ADD TABLE errors if already a member).
do $$
begin
  begin
    alter publication supabase_realtime add table account_deletion_requests;
  exception when duplicate_object then null;
  end;
end $$;
