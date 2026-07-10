-- ============================================================
-- L&T storefront — Supabase schema (starting point)
-- Run this in the Supabase SQL editor when you're ready to connect.
-- The ERP stays the source of truth; these tables are the read-optimized
-- mirror the storefront reads from, plus the order tables it writes to.
-- ============================================================

-- ---------- Catalog ----------
create table if not exists categories (
  id          text primary key,          -- e.g. 'cooking'
  name        text not null,
  sort        int  not null default 0
);

create table if not exists products (
  sku          text primary key,         -- ERP model number, e.g. 'PR-WR24'
  erp_id       text unique,              -- ERP internal id, for sync reconciliation
  name         text not null,
  category_id  text references categories(id),
  description  text,
  base_price   numeric(10,2) not null,   -- list price; contract prices live in prices
  images       text[] default '{}',      -- storage/CDN urls (real photos go here)
  specs        jsonb default '{}',       -- BTU, gauge, dimensions, certs, etc.
  status       text not null default 'active',  -- active | discontinued
  updated_at   timestamptz not null default now()
);

-- ---------- Inventory (per depot / warehouse) ----------
create table if not exists warehouses (
  id     text primary key,               -- e.g. 'depot-west'
  name   text not null,
  region text
);

create table if not exists inventory (
  sku            text references products(sku) on delete cascade,
  warehouse_id   text references warehouses(id) on delete cascade,
  qty_available  int not null default 0,
  lead_days      int not null default 0,   -- 0 = ships same/next day
  updated_at     timestamptz not null default now(),
  primary key (sku, warehouse_id)
);

-- ---------- B2B pricing (contract / customer-specific) ----------
create table if not exists price_lists (
  id     text primary key,               -- e.g. 'standard', 'contract-acme'
  name   text not null
);

create table if not exists prices (
  price_list_id text references price_lists(id) on delete cascade,
  sku           text references products(sku) on delete cascade,
  price         numeric(10,2) not null,
  primary key (price_list_id, sku)
);

-- ---------- Customers (trade accounts) ----------
-- Linked to Supabase Auth users. A customer belongs to one price list.
create table if not exists customers (
  id            uuid primary key references auth.users(id) on delete cascade,
  company       text,
  price_list_id text references price_lists(id) default 'standard',
  created_at    timestamptz not null default now()
);

-- ---------- Orders (written by storefront, pushed to ERP) ----------
create table if not exists orders (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid references customers(id),
  erp_order_no text,                      -- filled in after ERP accepts it
  status       text not null default 'pending', -- pending|submitted|shipped|invoiced|cancelled
  subtotal     numeric(10,2) not null default 0,
  freight      numeric(10,2) not null default 0,
  total        numeric(10,2) not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references orders(id) on delete cascade,
  sku        text references products(sku),
  name       text not null,              -- snapshot at time of order
  unit_price numeric(10,2) not null,     -- snapshot (may be a contract price)
  qty        int not null check (qty > 0)
);

-- ============================================================
-- Row Level Security (examples — tighten before launch)
-- ============================================================

-- Catalog is world-readable (anonymous shoppers browse it).
alter table products   enable row level security;
alter table categories enable row level security;
alter table inventory  enable row level security;
create policy "catalog is public" on products   for select using (true);
create policy "cats are public"   on categories for select using (true);
create policy "stock is public"   on inventory  for select using (true);

-- A customer can read only their own row and their own orders.
alter table customers  enable row level security;
alter table orders     enable row level security;
alter table order_items enable row level security;

create policy "own customer row" on customers
  for select using (auth.uid() = id);

create policy "own orders" on orders
  for select using (auth.uid() = customer_id);

create policy "create own orders" on orders
  for insert with check (auth.uid() = customer_id);

create policy "own order items" on order_items
  for select using (
    exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid())
  );

-- Contract prices: a customer sees only the price list assigned to them.
-- (Server-side resolution via a view/function is usually cleaner — see notes.)
alter table prices enable row level security;
create policy "own price list" on prices
  for select using (
    price_list_id = 'standard'
    or price_list_id in (select price_list_id from customers where id = auth.uid())
  );

-- ============================================================
-- Sync note: the ERP upserts into products / inventory / prices
-- (service-role key, bypasses RLS). The storefront only ever reads.
-- ============================================================
