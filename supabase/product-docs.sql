-- ============================================================
-- L&T storefront — product documents migration
-- Run this in the Supabase SQL editor. Safe to re-run.
-- Adds admin-managed downloadable documents per product
-- (spec sheets, manuals, warranty, elevation charts, brochures…).
-- ============================================================

-- Array of { "label": text, "url": text } objects.
alter table products add column if not exists documents jsonb not null default '[]';

-- Public bucket the admin uploads product PDFs/documents to (reads are public).
insert into storage.buckets (id, name, public)
values ('product-docs', 'product-docs', true)
on conflict (id) do update set public = true;

drop policy if exists "product docs public read" on storage.objects;
create policy "product docs public read" on storage.objects
  for select using (bucket_id = 'product-docs');

drop policy if exists "admins manage product docs" on storage.objects;
create policy "admins manage product docs" on storage.objects
  for all using (bucket_id = 'product-docs' and public.is_admin())
  with check (bucket_id = 'product-docs' and public.is_admin());
