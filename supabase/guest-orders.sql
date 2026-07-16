-- Guest checkout: persist orders placed without an account.
-- orders.customer_id is already nullable (references customers on delete set null),
-- so a guest order simply has a null customer_id. We add the guest's contact so
-- the order is fulfillable and can be looked up later by order # + email.
--
-- Guest reads never happen through RLS (a guest has no session) — the
-- /api/orders/lookup route uses the service-role key and verifies the supplied
-- email against guest_email (or the owning customer's email) before returning an
-- order. So no new RLS policy is required here.

alter table orders add column if not exists guest_email text;
alter table orders add column if not exists guest_name  text;
alter table orders add column if not exists guest_phone text;

-- Speeds up the order # + email guest lookup.
create index if not exists orders_guest_email_idx on orders (guest_email);
