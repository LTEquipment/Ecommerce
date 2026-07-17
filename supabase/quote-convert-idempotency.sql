-- Idempotent RFQ→order conversion. Records which order a quote was converted
-- into so a second "Create order from quote" click (reload, second admin, stale
-- list) returns the existing order instead of creating a duplicate. Nullable, so
-- existing rows and the convert route's fallback are unaffected until this runs.
alter table quote_requests add column if not exists converted_order_id uuid references orders(id) on delete set null;
