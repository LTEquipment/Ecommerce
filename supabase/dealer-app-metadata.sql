-- One-time backfill for the dealer-entitlement hardening.
--
-- Entitlement (isDealer -> contract pricing) now reads server-controlled
-- app_metadata instead of the self-writable user_metadata, so a customer can no
-- longer self-approve via supabase.auth.updateUser() (see components/AuthProvider.tsx
-- and app/api/admin/customers/route.ts). This copies any EXISTING approved/rejected
-- dealer status from user_metadata into app_metadata so current dealers keep their
-- status. Pending requests stay in user_metadata (display only) with no app_metadata,
-- which correctly reads as "not approved". Run once after deploying.

update auth.users
set raw_app_meta_data =
      coalesce(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('dealer_status', raw_user_meta_data->>'dealer_status')
where raw_user_meta_data->>'dealer_status' in ('approved', 'rejected');
