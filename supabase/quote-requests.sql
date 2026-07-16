-- ============================================================
-- Request-a-Quote (RFQ). B2B buyers submit a cart for formal pricing.
-- Written ONLY by the service-role /api/quotes route (recomputes list prices
-- server-side, never trusts the client). No client write policy; admins manage.
-- Guests may request quotes (email required); customer_id links it when signed in.
-- ============================================================

create table if not exists quote_requests (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null,
  name        text,
  company     text,
  email       text not null,
  phone       text,
  notes       text,
  subtotal    numeric(10,2) not null default 0,
  status      text not null default 'new',  -- new | quoted | won | lost
  created_at  timestamptz not null default now()
);

create table if not exists quote_request_items (
  id         uuid primary key default gen_random_uuid(),
  quote_id   uuid references quote_requests(id) on delete cascade,
  sku        text,
  name       text not null,
  unit_price numeric(10,2) not null,
  qty        int not null check (qty > 0)
);

create index if not exists quote_requests_status_idx on quote_requests (status, created_at desc);

alter table quote_requests enable row level security;
alter table quote_request_items enable row level security;

-- Admins manage everything; a signed-in user may read their own requests.
drop policy if exists "admins manage quotes" on quote_requests;
create policy "admins manage quotes" on quote_requests for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "own quotes read" on quote_requests;
create policy "own quotes read" on quote_requests for select using (auth.uid() = customer_id);

drop policy if exists "admins manage quote items" on quote_request_items;
create policy "admins manage quote items" on quote_request_items for all
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "own quote items read" on quote_request_items;
create policy "own quote items read" on quote_request_items for select using (
  exists (select 1 from quote_requests q where q.id = quote_id and (q.customer_id = auth.uid() or public.is_admin()))
);
