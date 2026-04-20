-- 001_serial_booking_ref.sql
--
-- Replaces the hash-based booking_ref generator (DZC-A1B2C3, impossible
-- to read aloud and looks random) with a real serial format:
--
--   WSL-YY-NNNNNN     e.g.  WSL-26-000001, WSL-26-000002, ...
--
-- Safe to run against a live database. Existing rows keep their old
-- DZC-* refs (no data rewrite). Only new bookings adopt the new shape.
--
-- If you later want to back-fill old rows, do it in a separate manual
-- pass: old refs are user-visible and were probably already shared.
--
-- Usage:
--   psql $SUPABASE_DB_URL -f supabase/migrations/001_serial_booking_ref.sql
-- or paste the contents into the Supabase SQL Editor.

begin;

-- 1. Sequence the trigger will draw from. `start 1` is fine even if some
--    bookings already exist — the new refs just begin fresh with their
--    own prefix style, so there's no collision with old DZC-* values.
create sequence if not exists public.bookings_serial_seq start 1;

-- 2. Redefine the trigger function.
create or replace function public.generate_booking_ref()
returns trigger language plpgsql as $$
declare
  serial_num bigint;
begin
  if new.booking_ref is null or new.booking_ref = '' then
    serial_num := nextval('public.bookings_serial_seq');
    new.booking_ref :=
      'WSL-' || to_char(now(), 'YY') || '-' || lpad(serial_num::text, 6, '0');
  end if;
  return new;
end;
$$;

-- 3. Re-attach the trigger (idempotent).
drop trigger if exists set_booking_ref on public.bookings;
create trigger set_booking_ref
  before insert on public.bookings
  for each row execute procedure public.generate_booking_ref();

commit;
