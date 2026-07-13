-- ============================================================
-- L&T storefront — Supabase schema (full, storefront-shaped)
-- Run this in the Supabase SQL editor. Safe to re-run.
-- ============================================================

-- ---------- Catalog ----------
create table if not exists categories (
  id     text primary key,               -- e.g. 'wok-range'
  name   text not null,
  art    text not null default 'range',  -- fallback illustration key
  blurb  text,
  count  text,                           -- display label, e.g. 'Signature series'
  sort   int  not null default 0
);

create table if not exists products (
  slug         text primary key,         -- url id, e.g. '52527'
  sku          text not null,            -- display model number
  name         text not null,
  category_id  text references categories(id),
  art          text not null default 'range',
  brand        text,
  description  text,
  price        numeric(10,2) not null,
  was_price    numeric(10,2),
  images       text[] not null default '{}',
  specs        jsonb  not null default '{}',
  rating       numeric(2,1) not null default 4.7,
  reviews      int    not null default 0,
  badge        text   not null default '',   -- 'Sale' | 'New' | ''
  stock        text   not null default 'in', -- 'in' | 'back'
  sort         int    not null default 0,
  updated_at   timestamptz not null default now()
);

-- ---------- Admins (who may edit the catalog) ----------
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------- Customers (trade accounts) ----------
create table if not exists customers (
  id         uuid primary key references auth.users(id) on delete cascade,
  company    text,
  created_at timestamptz not null default now()
);

-- ---------- Orders ----------
create table if not exists orders (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete set null,
  status      text not null default 'submitted', -- submitted|processing|shipped|delivered|cancelled
  subtotal    numeric(10,2) not null default 0,
  freight     numeric(10,2) not null default 0,
  total       numeric(10,2) not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references orders(id) on delete cascade,
  sku        text,
  name       text not null,
  unit_price numeric(10,2) not null,
  qty        int not null check (qty > 0)
);

-- ---------- Forms ----------
create table if not exists contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  company    text,
  email      text,
  phone      text,
  message    text,
  created_at timestamptz not null default now()
);

create table if not exists subscribers (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table categories      enable row level security;
alter table products        enable row level security;
alter table admins          enable row level security;
alter table customers       enable row level security;
alter table orders          enable row level security;
alter table order_items     enable row level security;
alter table contact_messages enable row level security;
alter table subscribers     enable row level security;

-- helper: is the current user an admin?
create or replace function public.is_admin() returns boolean
  language sql stable security definer set search_path = public as
$$ select exists(select 1 from admins where user_id = auth.uid()) $$;

-- Catalog: world-readable; only admins write.
drop policy if exists "catalog public read" on products;
create policy "catalog public read" on products for select using (true);
drop policy if exists "cats public read" on categories;
create policy "cats public read" on categories for select using (true);

drop policy if exists "admins write products" on products;
create policy "admins write products" on products for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins write cats" on categories;
create policy "admins write cats" on categories for all
  using (public.is_admin()) with check (public.is_admin());

-- Admins: a user can see whether they themselves are an admin.
drop policy if exists "see own admin row" on admins;
create policy "see own admin row" on admins for select using (auth.uid() = user_id);

-- Customers: own row.
drop policy if exists "own customer row" on customers;
create policy "own customer row" on customers for select using (auth.uid() = id);
drop policy if exists "upsert own customer" on customers;
create policy "upsert own customer" on customers for insert with check (auth.uid() = id);
drop policy if exists "update own customer" on customers;
create policy "update own customer" on customers for update using (auth.uid() = id);

-- Orders: own orders (admins can read all).
drop policy if exists "own orders read" on orders;
create policy "own orders read" on orders for select using (auth.uid() = customer_id or public.is_admin());
drop policy if exists "create own orders" on orders;
create policy "create own orders" on orders for insert with check (auth.uid() = customer_id);
drop policy if exists "admins update orders" on orders;
create policy "admins update orders" on orders for update using (public.is_admin());

drop policy if exists "own order items" on order_items;
create policy "own order items" on order_items for select using (
  exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or public.is_admin()))
);
drop policy if exists "insert own order items" on order_items;
create policy "insert own order items" on order_items for insert with check (
  exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
);

-- Forms: anyone may submit; only admins may read.
drop policy if exists "anyone submits contact" on contact_messages;
create policy "anyone submits contact" on contact_messages for insert with check (true);
drop policy if exists "admins read contact" on contact_messages;
create policy "admins read contact" on contact_messages for select using (public.is_admin());

drop policy if exists "anyone subscribes" on subscribers;
create policy "anyone subscribes" on subscribers for insert with check (true);
drop policy if exists "admins read subs" on subscribers;
create policy "admins read subs" on subscribers for select using (public.is_admin());

-- ---------- After-sales platform (warranty + service) ----------
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

-- ---------- Audit log (admin actions) ----------
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null,
  target      text,
  detail      text,
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on audit_log (created_at desc);
alter table audit_log enable row level security;
drop policy if exists "admins read audit" on audit_log;
create policy "admins read audit" on audit_log for select using (public.is_admin());
drop policy if exists "admins write audit" on audit_log;
create policy "admins write audit" on audit_log for insert with check (public.is_admin());

-- ============================================================
-- Realtime: broadcast catalog + order changes to subscribed clients
-- ============================================================
-- Idempotent: Supabase may auto-add tables to supabase_realtime, and
-- ALTER PUBLICATION ... ADD TABLE errors if the table is already a member.
do $$
declare t text;
begin
  foreach t in array array['products','orders','warranty_claims','service_tickets','audit_log'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;

-- ============================================================
-- After running this, seed the catalog:  npm run seed
-- and make yourself an admin (replace the email):
--   insert into admins (user_id)
--   select id from auth.users where email = 'you@example.com';
-- ============================================================
