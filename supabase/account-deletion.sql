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
