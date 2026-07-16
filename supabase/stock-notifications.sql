-- ============================================================
-- Back-in-stock notifications.
-- Captures an email + product so we can notify when a backordered item returns.
-- Public may INSERT their own request (like contact/subscribe); only admins read.
-- ============================================================

create table if not exists stock_notifications (
  id           uuid primary key default gen_random_uuid(),
  product_slug text not null,
  sku          text,
  email        text not null,
  notified     boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (product_slug, email)   -- one standing request per product per email
);

create index if not exists stock_notifications_slug_idx
  on stock_notifications (product_slug) where notified = false;

alter table stock_notifications enable row level security;

-- Anyone may register interest (same posture as contact_messages / subscribers).
drop policy if exists "anyone requests stock notify" on stock_notifications;
create policy "anyone requests stock notify" on stock_notifications
  for insert with check (true);

-- Only admins may read/manage the list.
drop policy if exists "admins read stock notify" on stock_notifications;
create policy "admins read stock notify" on stock_notifications
  for select using (public.is_admin());
drop policy if exists "admins manage stock notify" on stock_notifications;
create policy "admins manage stock notify" on stock_notifications
  for all using (public.is_admin()) with check (public.is_admin());
