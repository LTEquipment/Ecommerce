-- ============================================================
-- Contact inbox triage: let admins mark contact messages as handled.
-- ============================================================

alter table contact_messages add column if not exists handled boolean not null default false;

-- Admins may update messages (to flip 'handled'). Reads are already admin-only.
drop policy if exists "admins update contact" on contact_messages;
create policy "admins update contact" on contact_messages for update
  using (public.is_admin()) with check (public.is_admin());
