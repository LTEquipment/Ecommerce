-- ============================================================
-- Audit log — run once in the Supabase SQL editor
-- (Dashboard → SQL → New query → paste → Run). Records every
-- admin action (product edits, order/claim/ticket status changes,
-- dealer approvals, admin grants). Admin-only read + insert.
-- ============================================================
create table if not exists audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null,   -- e.g. 'product.update', 'order.status', 'dealer.approve', 'admin.grant'
  target      text,            -- what was acted on (sku / order id / email)
  detail      text,            -- human-readable summary
  created_at  timestamptz not null default now()
);
create index if not exists audit_log_created_idx on audit_log (created_at desc);

alter table audit_log enable row level security;
drop policy if exists "admins read audit" on audit_log;
create policy "admins read audit" on audit_log for select using (public.is_admin());
drop policy if exists "admins write audit" on audit_log;
create policy "admins write audit" on audit_log for insert with check (public.is_admin());

-- live updates (idempotent)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'audit_log'
  ) then
    alter publication supabase_realtime add table public.audit_log;
  end if;
end $$;
