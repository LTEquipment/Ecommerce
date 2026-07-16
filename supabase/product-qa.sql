-- ============================================================
-- Pre-purchase product Q&A. Signed-in customers ask; staff (admins) answer.
-- Auto-publish; admins moderate. Questions are written by the service-role API
-- (snapshots a privacy-preserving author name); admins answer/moderate directly.
-- ============================================================

create table if not exists product_questions (
  id           uuid primary key default gen_random_uuid(),
  product_slug text not null,
  user_id      uuid references auth.users(id) on delete set null,
  author_name  text not null default 'Customer',
  question     text not null,
  answer       text,
  answered_by  text,
  answered_at  timestamptz,
  status       text not null default 'published',  -- published | hidden
  created_at   timestamptz not null default now()
);

create index if not exists product_questions_slug_idx on product_questions (product_slug) where status = 'published';

alter table product_questions enable row level security;

-- Public sees published questions; users see their own; admins see all.
drop policy if exists "questions public read" on product_questions;
create policy "questions public read" on product_questions for select
  using (status = 'published' or auth.uid() = user_id or public.is_admin());

-- Admins answer / hide / delete. No client write policy — asks go through the
-- service-role /api/questions route (which snapshots the author name).
drop policy if exists "admins manage questions" on product_questions;
create policy "admins manage questions" on product_questions for all
  using (public.is_admin()) with check (public.is_admin());
