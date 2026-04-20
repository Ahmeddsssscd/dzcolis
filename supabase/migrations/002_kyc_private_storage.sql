-- 002_kyc_private_storage.sql
--
-- Makes the `kyc-documents` storage bucket PRIVATE and adds row-level
-- policies so:
--   - a signed-in user can upload/read only their own folder (`{user_id}/...`)
--   - nobody else can list, read, or download another user's documents
--   - the service-role key (used by the admin API) still bypasses RLS,
--     so the admin panel continues to work via short-lived signed URLs
--
-- Why this matters: a previous admin page constructed URLs of the form
--   /storage/v1/object/public/kyc-documents/...
-- which only works if the bucket is public. A public KYC bucket = anyone
-- with a guessed/leaked path can download government ID scans. That's a
-- GDPR + Algerian law 18-07 violation. This migration closes the hole.
--
-- Safe to run multiple times. Idempotent.
--
-- Usage:
--   psql $SUPABASE_DB_URL -f supabase/migrations/002_kyc_private_storage.sql
-- or paste into the Supabase SQL Editor.

begin;

-- 1. Ensure the bucket exists and is PRIVATE.
--    `public = false` means no anonymous URL like /object/public/... works;
--    all reads must go through signed URLs or a service-role key.
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do update
  set public = false;

-- 2. Drop existing policies (old permissive ones AND any prior run of this
--    migration — Postgres has no `create policy if not exists`, so we must
--    drop-then-create every policy by name we're about to define, otherwise
--    a re-run of this migration fails on the second `create policy` and
--    leaves the bucket in a half-migrated state.
drop policy if exists "kyc_documents_public_read"  on storage.objects;
drop policy if exists "kyc_documents_owner_read"   on storage.objects;
drop policy if exists "kyc_documents_owner_write"  on storage.objects;
drop policy if exists "kyc_documents_owner_update" on storage.objects;
drop policy if exists "kyc_documents_owner_delete" on storage.objects;

-- 3. Per-user read access.
--    The file path convention used by the app is `{user_id}/cin-front-<ts>`,
--    so the first path segment always equals the uploading user's id.
create policy "kyc_documents_owner_read"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Per-user write access (upload).
create policy "kyc_documents_owner_write"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Per-user update (re-submit same path).
create policy "kyc_documents_owner_update"
  on storage.objects for update
  using (
    bucket_id = 'kyc-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. Per-user delete (user scrubs their own docs).
create policy "kyc_documents_owner_delete"
  on storage.objects for delete
  using (
    bucket_id = 'kyc-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admins never hit the policies above because the admin API uses the
-- service-role key, which bypasses RLS entirely. The admin panel will
-- generate short-lived signed URLs on demand.

commit;
