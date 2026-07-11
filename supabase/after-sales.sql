-- ============================================================
-- After-Sales Platform — run this once in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste → Run). It is also included
-- in schema.sql; this file is just the delta for an existing DB.
-- ============================================================

create table if not exists warranty_claims (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  model      text,
  sku        text,
  issue      text,
  status     text not null default 'submitted',  -- submitted|in_review|approved|resolved|rejected
  created_at timestamptz not null default now()
);

create table if not exists service_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  subject    text,
  message    text,
  status     text not null default 'open',        -- open|in_progress|resolved|closed
  created_at timestamptz not null default now()
);

alter table warranty_claims enable row level security;
alter table service_tickets enable row level security;

-- Users see/create their own rows; admins can read + update everything.
drop policy if exists "own claims" on warranty_claims;
create policy "own claims" on warranty_claims for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "create claims" on warranty_claims;
create policy "create claims" on warranty_claims for insert with check (auth.uid() = user_id);
drop policy if exists "admins update claims" on warranty_claims;
create policy "admins update claims" on warranty_claims for update using (public.is_admin());

drop policy if exists "own tickets" on service_tickets;
create policy "own tickets" on service_tickets for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "create tickets" on service_tickets;
create policy "create tickets" on service_tickets for insert with check (auth.uid() = user_id);
drop policy if exists "admins update tickets" on service_tickets;
create policy "admins update tickets" on service_tickets for update using (public.is_admin());

-- Live status updates
alter publication supabase_realtime add table warranty_claims;
alter publication supabase_realtime add table service_tickets;
