-- B2B checkout fields on orders: purchase-order number and tax-exemption.
-- All nullable/defaulted so existing rows and the order-creation fallback are
-- unaffected. Nothing is charged online (payment stays 'pending' and staff
-- confirm the final total), so a tax-exempt order simply carries tax = 0 and a
-- flag + resale certificate for the team to verify before payment.

alter table orders add column if not exists po_number   text;
alter table orders add column if not exists tax_exempt   boolean not null default false;
alter table orders add column if not exists resale_cert  text;

-- Dealer contract pricing is driven by a single admin-set discount in
-- site_settings ('dealer_discount_pct', default 0 = list price), applied
-- server-side to approved dealers' order/quote line items. No column needed.
