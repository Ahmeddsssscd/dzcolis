-- ────────────────────────────────────────────────────────────────────
-- Contact messages
--
-- Every /contact submission lands here first, then an email notifier
-- fires. This way, even if Resend is misconfigured or throttled, the
-- message is never lost — the admin can still read it in /admin/contact.
--
-- `user_id` is a NOT NULL FK to auth.users: the public form now
-- requires a signed-in Waselli account to submit. This is our spam
-- control (an attacker can't just flood the form anonymously).
--
-- RLS on, zero policies — service-role only. Never expose contact
-- messages to anon/authenticated clients; they contain the visitor's
-- email address, phone, and free-form text that may include sensitive
-- info ("I was scammed by driver X", "my credit card…").
-- ────────────────────────────────────────────────────────────────────

create table if not exists public.contact_messages (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  email       text        not null,
  subject     text        not null,
  message     text        not null,
  ip          text        null,
  status      text        not null default 'new'
                          check (status in ('new','read','archived')),
  read_at     timestamptz null,
  read_by     uuid        null references public.admin_users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages(status, created_at desc);

create index if not exists contact_messages_user_idx
  on public.contact_messages(user_id, created_at desc);

alter table public.contact_messages enable row level security;
