-- ────────────────────────────────────────────────────────────────────
-- Live support chat
--
-- Two tables. Both are service-role-only — every query goes through
-- our Next.js API routes with a token check (for visitors) or an
-- admin session check (for agents), so Row-Level Security stays off.
-- Exposing these tables on the anon key would be a privacy disaster:
-- visitor messages include their email and whatever they type.
--
-- Visitor identity model:
--   • On first POST /api/support/chats we mint a random `visitor_token`
--     (uuid). The browser stores it in localStorage keyed by chat id
--     and sends it as `x-support-token` on every subsequent request.
--   • `visitor_token` is the authorisation proof — losing it kills
--     access, but that's acceptable for a support chat (the visitor
--     can always start a new one).
--
-- Queue / "make them wait" model:
--   • New chat → status='open', claimed_by=null.
--   • Agent opens /admin/support → oldest open chat is shown first.
--   • Agent clicks "Claim" → status='claimed', claimed_by=<admin id>.
--   • Either side can mark the chat closed; closed chats disappear
--     from the queue but stay readable via direct link.
-- ────────────────────────────────────────────────────────────────────

create table if not exists public.support_chats (
  id                uuid        primary key default gen_random_uuid(),
  visitor_name      text        not null,
  visitor_email     text        not null,
  visitor_token     text        not null unique,
  visitor_user_id   uuid        null references auth.users(id) on delete set null,
  subject           text        null,
  status            text        not null default 'open'
                              check (status in ('open','claimed','closed')),
  claimed_by        uuid        null references public.admin_users(id) on delete set null,
  claimed_at        timestamptz null,
  closed_at         timestamptz null,
  last_activity_at  timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists support_chats_status_activity_idx
  on public.support_chats(status, last_activity_at desc);

create index if not exists support_chats_claimed_by_idx
  on public.support_chats(claimed_by)
  where claimed_by is not null;

create table if not exists public.support_chat_messages (
  id          uuid        primary key default gen_random_uuid(),
  chat_id     uuid        not null references public.support_chats(id) on delete cascade,
  author      text        not null check (author in ('visitor','agent','system')),
  admin_id    uuid        null references public.admin_users(id) on delete set null,
  body        text        not null,
  created_at  timestamptz not null default now()
);

create index if not exists support_chat_messages_chat_created_idx
  on public.support_chat_messages(chat_id, created_at asc);

-- RLS on, zero policies — the anon/authenticated keys cannot read or
-- write either table. Our API routes use the service-role client
-- which bypasses RLS.
alter table public.support_chats         enable row level security;
alter table public.support_chat_messages enable row level security;

-- Touch helper: bump the parent chat's activity timestamp on every
-- new message so the queue can sort by "most recent activity first".
create or replace function public.support_chat_touch() returns trigger as $$
begin
  update public.support_chats
     set last_activity_at = now()
   where id = new.chat_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists support_chat_touch_trg on public.support_chat_messages;
create trigger support_chat_touch_trg
  after insert on public.support_chat_messages
  for each row
  execute function public.support_chat_touch();
