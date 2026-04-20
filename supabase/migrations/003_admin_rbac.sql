-- 003_admin_rbac.sql
--
-- Replaces the "one shared ADMIN_PASSWORD in env" model with a real
-- admin-user table + roles. After this migration:
--
--   - Every admin has their own account (email + bcrypt hash)
--   - Each admin has a role (super_admin | admin | moderator | support | viewer)
--   - Only super_admin can create/modify other admins
--   - Every admin mutation writes an audit row (admin_audit_log)
--   - A stolen session cookie is no longer a forever-pass: the owning
--     admin can be deactivated (is_active=false) and the cookie instantly
--     stops working, because auth looks up the row on every request.
--
-- Bootstrap: the first login attempt made with the legacy `ADMIN_PASSWORD`
-- env var (when the table is empty) creates the first super_admin. After
-- that, only in-app invitations work.
--
-- Safe to run multiple times. Idempotent.
--
-- Usage:
--   psql $SUPABASE_DB_URL -f supabase/migrations/003_admin_rbac.sql
-- or paste into the Supabase SQL Editor.

begin;

-- 1. Role enum. Ordered by capability ascending so anything that needs
--    "at least X" can compare against a sorted list in the app layer.
do $$
begin
  if not exists (select 1 from pg_type where typname = 'admin_role') then
    create type public.admin_role as enum (
      'viewer',      -- read-only dashboards
      'support',     -- + resolve disputes, respond to users
      'moderator',   -- + approve KYC, courier applications
      'admin',       -- + settings, refunds, payouts
      'super_admin'  -- + manage admin users, everything
    );
  end if;
end $$;

-- 2. admin_users table.
--    `password_hash` is bcrypt (cost 10+). NEVER store plaintext here.
--    `email` is the login identifier, case-insensitive via citext if
--    available — fall back to lower() uniqueness otherwise.
create table if not exists public.admin_users (
  id              uuid primary key default gen_random_uuid(),
  email           text not null,
  password_hash   text not null,
  full_name       text,
  role            public.admin_role not null default 'viewer',
  is_active       boolean not null default true,
  last_login_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  created_by      uuid references public.admin_users(id) on delete set null
);

-- Case-insensitive unique email. We don't rely on citext (not always
-- installed on Supabase projects); a functional index on lower(email)
-- gives the same guarantee and is portable.
create unique index if not exists admin_users_email_lower_key
  on public.admin_users (lower(email));

-- 3. admin_audit_log — append-only record of admin mutations.
create table if not exists public.admin_audit_log (
  id           bigserial primary key,
  actor_id     uuid references public.admin_users(id) on delete set null,
  actor_email  text,                         -- snapshotted so log survives admin deletion
  action       text not null,                -- e.g. 'kyc.approve', 'admin.create', 'settings.update'
  target_type  text,                         -- e.g. 'user', 'booking', 'admin_user'
  target_id    text,                         -- free-form so we can log uuid OR booking_ref etc.
  metadata     jsonb not null default '{}'::jsonb,
  ip           text,
  at           timestamptz not null default now()
);

create index if not exists admin_audit_log_at_desc_idx
  on public.admin_audit_log (at desc);
create index if not exists admin_audit_log_actor_idx
  on public.admin_audit_log (actor_id);
create index if not exists admin_audit_log_action_idx
  on public.admin_audit_log (action);

-- 4. updated_at trigger.
create or replace function public.admin_users_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists admin_users_touch_updated_at on public.admin_users;
create trigger admin_users_touch_updated_at
  before update on public.admin_users
  for each row execute function public.admin_users_touch_updated_at();

-- 5. RLS. These tables are ONLY meant to be read/written by the admin
--    API routes, which use the service-role key (RLS-bypass). We still
--    enable RLS with no policies, so the anon / authenticated keys
--    cannot touch them even if a future code path accidentally reaches
--    for the wrong client. "Deny by default" is the whole point.
alter table public.admin_users     enable row level security;
alter table public.admin_audit_log enable row level security;

-- Intentionally NO policies. Service-role bypasses RLS; everyone else
-- gets denied. If you ever need a policy here, write it tightly.

commit;
