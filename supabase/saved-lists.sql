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
