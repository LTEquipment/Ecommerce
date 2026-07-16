-- ============================================================
-- Saved shipping addresses for reuse at checkout. Each customer manages their
-- own (RLS scoped to auth.uid()); read/written directly by the browser client.
-- ============================================================

create table if not exists customer_addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  label      text,
  name       text,
  company    text,
  phone      text,
  address    text not null,
  city       text,
  state      text,
  zip        text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists customer_addresses_user_idx on customer_addresses (user_id);

alter table customer_addresses enable row level security;

drop policy if exists "own addresses" on customer_addresses;
create policy "own addresses" on customer_addresses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
