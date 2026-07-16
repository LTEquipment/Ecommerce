-- ============================================================
-- Order fulfillment: record carrier + tracking when an order ships so customers
-- can follow it. Written by admins (existing "admins update orders" policy).
-- ============================================================

alter table orders add column if not exists carrier         text;         -- UPS | FedEx | USPS | Freight / LTL | Other
alter table orders add column if not exists tracking_number text;
alter table orders add column if not exists shipped_at      timestamptz;
