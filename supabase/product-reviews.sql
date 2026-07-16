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
