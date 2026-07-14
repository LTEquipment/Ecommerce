-- Orders hardening — closes the client-side payment/price tampering hole (C1/H1).
--
-- Order creation now happens exclusively through the server route
-- app/api/orders/route.ts, which authenticates the caller, recomputes every
-- price and total from the catalog, and forces payment_status = 'pending'.
-- That route writes with the service-role key (bypasses RLS), so the browser
-- (anon key) no longer needs — and must not have — direct INSERT on orders or
-- order_items. Previously the only RLS check was `auth.uid() = customer_id`,
-- which let any signed-in user insert an order with payment_status='paid',
-- amount_paid=0.01, total=0.01 and order_items at unit_price=0 straight from
-- the browser console.
--
-- Deployment order: deploy the app code (which routes checkout through
-- /api/orders) FIRST, confirm checkout works, THEN run this. Safe to run before
-- or after payments.sql. SELECT/UPDATE policies are unchanged — customers still
-- read their own orders; admins still update them.

drop policy if exists "create own orders" on orders;
drop policy if exists "insert own order items" on order_items;

-- No replacement INSERT policy is created: with RLS enabled and no INSERT policy,
-- the anon key cannot insert into these tables at all. The service-role server
-- route (app/api/orders/route.ts) remains the single, price-authoritative path.
