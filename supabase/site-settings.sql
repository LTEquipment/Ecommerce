-- Site settings — small key/value store for admin-toggled feature flags.
-- Run this in the Supabase SQL editor (depends on public.is_admin() from schema.sql).

create table if not exists site_settings (
  key        text primary key,
  value      jsonb not null default 'null'::jsonb,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

-- World-readable: the footer, top bar and pages read flags for every visitor.
drop policy if exists "settings public read" on site_settings;
create policy "settings public read" on site_settings for select using (true);

-- Only admins may change a setting.
drop policy if exists "admins write settings" on site_settings;
create policy "admins write settings" on site_settings for all
  using (public.is_admin()) with check (public.is_admin());

-- Default: Investor Relations hidden until an admin turns it on.
insert into site_settings (key, value)
values ('investor_relations_enabled', 'false'::jsonb)
on conflict (key) do nothing;
