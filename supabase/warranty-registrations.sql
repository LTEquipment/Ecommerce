-- ============================================================
-- Warranty registration: customers register purchased equipment (serial,
-- purchase date, dealer) so coverage + service history is on file. Distinct from
-- warranty_claims (filed later when something fails). Own-row RLS; admins read.
-- ============================================================

create table if not exists warranty_registrations (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  model          text,
  sku            text,
  serial_number  text,
  purchase_date  date,
  purchased_from text,
  notes          text,
  created_at     timestamptz not null default now()
);

create index if not exists warranty_registrations_user_idx on warranty_registrations (user_id);

alter table warranty_registrations enable row level security;

drop policy if exists "own registrations" on warranty_registrations;
create policy "own registrations" on warranty_registrations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "admins read registrations" on warranty_registrations;
create policy "admins read registrations" on warranty_registrations for select using (public.is_admin());
