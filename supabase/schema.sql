-- ============================================================
-- DZColis — Full Production Schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New query)
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── profiles ────────────────────────────────────────────────
-- Extends auth.users (one row per registered user)
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  first_name    text not null default '',
  last_name     text not null default '',
  phone         text not null default '',
  wilaya        text not null default '',
  role          text not null default 'user' check (role in ('user','admin')),
  kyc_status    text not null default 'none' check (kyc_status in ('none','submitted','reviewing','approved','rejected')),
  referral_code text unique,
  referred_by   text,
  rating        numeric(3,2) not null default 5.00,
  review_count  integer not null default 0,
  created_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_code text;
begin
  v_code := 'DZC-' ||
    upper(substring(new.raw_user_meta_data->>'first_name' from 1 for 4)) ||
    '-' ||
    upper(substring(md5(random()::text) from 1 for 4));
  insert into public.profiles (id, first_name, last_name, phone, wilaya, referral_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name',  ''),
    coalesce(new.raw_user_meta_data->>'phone',       ''),
    coalesce(new.raw_user_meta_data->>'wilaya',      ''),
    v_code
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── listings ────────────────────────────────────────────────
create table if not exists public.listings (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  from_city        text not null,
  to_city          text not null,
  departure_date   date not null,
  arrival_date     date,
  available_weight numeric(6,2) not null,
  price_per_kg     numeric(8,2) not null,
  description      text not null default '',
  status           text not null default 'active' check (status in ('active','full','cancelled','completed')),
  is_international boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ── bookings ────────────────────────────────────────────────
create table if not exists public.bookings (
  id               uuid primary key default uuid_generate_v4(),
  listing_id       uuid not null references public.listings(id) on delete restrict,
  sender_id        uuid not null references public.profiles(id) on delete restrict,
  weight           numeric(6,2) not null,
  dimensions       text,
  content          text not null,
  pickup_address   text not null,
  recipient_name   text not null,
  recipient_phone  text not null,
  instructions     text,
  status           text not null default 'pending'
                   check (status in ('pending','accepted','in_transit','delivered','cancelled')),
  payment_status   text not null default 'unpaid'
                   check (payment_status in ('unpaid','pending','paid','refunded')),
  total_amount     numeric(10,2) not null,
  booking_ref      text unique not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-generate booking_ref
create or replace function public.generate_booking_ref()
returns trigger language plpgsql as $$
begin
  new.booking_ref := 'DZC-' || upper(substring(md5(new.id::text) from 1 for 6));
  return new;
end;
$$;

drop trigger if exists set_booking_ref on public.bookings;
create trigger set_booking_ref
  before insert on public.bookings
  for each row execute procedure public.generate_booking_ref();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

-- ── payments ────────────────────────────────────────────────
create table if not exists public.payments (
  id            uuid primary key default uuid_generate_v4(),
  booking_id    uuid not null references public.bookings(id) on delete restrict,
  user_id       uuid not null references public.profiles(id) on delete restrict,
  amount        numeric(10,2) not null,
  currency      text not null default 'DZD',
  provider      text not null default 'chargily',
  provider_ref  text,
  checkout_url  text,
  status        text not null default 'pending'
                check (status in ('pending','paid','failed','refunded')),
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists payments_updated_at on public.payments;
create trigger payments_updated_at
  before update on public.payments
  for each row execute procedure public.set_updated_at();

-- ── kyc_documents ───────────────────────────────────────────
create table if not exists public.kyc_documents (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade unique,
  cin_recto_url text,
  cin_verso_url text,
  selfie_url    text,
  status        text not null default 'submitted'
                check (status in ('submitted','reviewing','approved','rejected')),
  admin_note    text,
  submitted_at  timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references public.profiles(id)
);

-- ── reviews ─────────────────────────────────────────────────
create table if not exists public.reviews (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid not null references public.bookings(id) on delete cascade,
  reviewer_id  uuid not null references public.profiles(id) on delete cascade,
  reviewed_id  uuid not null references public.profiles(id) on delete cascade,
  rating       integer not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz not null default now(),
  unique(booking_id, reviewer_id)
);

-- Update profile rating after review insert/update
create or replace function public.update_profile_rating()
returns trigger language plpgsql as $$
begin
  update public.profiles
  set
    rating       = (select round(avg(rating)::numeric, 2) from public.reviews where reviewed_id = new.reviewed_id),
    review_count = (select count(*) from public.reviews where reviewed_id = new.reviewed_id)
  where id = new.reviewed_id;
  return new;
end;
$$;

drop trigger if exists after_review_upsert on public.reviews;
create trigger after_review_upsert
  after insert or update on public.reviews
  for each row execute procedure public.update_profile_rating();

-- ── notifications ───────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  message    text not null,
  read       boolean not null default false,
  data       jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.listings       enable row level security;
alter table public.bookings       enable row level security;
alter table public.payments       enable row level security;
alter table public.kyc_documents  enable row level security;
alter table public.reviews        enable row level security;
alter table public.notifications  enable row level security;

-- profiles
create policy "Users can read any profile"
  on public.profiles for select using (true);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- listings
create policy "Anyone can read active listings"
  on public.listings for select using (true);
create policy "Auth users can insert listings"
  on public.listings for insert with check (auth.uid() = user_id);
create policy "Owners can update own listings"
  on public.listings for update using (auth.uid() = user_id);

-- bookings
create policy "Sender or transporter can see booking"
  on public.bookings for select using (
    auth.uid() = sender_id or
    auth.uid() = (select user_id from public.listings where id = listing_id)
  );
create policy "Auth users can create bookings"
  on public.bookings for insert with check (auth.uid() = sender_id);
create policy "Involved parties can update booking"
  on public.bookings for update using (
    auth.uid() = sender_id or
    auth.uid() = (select user_id from public.listings where id = listing_id)
  );

-- payments
create policy "Own payments only"
  on public.payments for select using (auth.uid() = user_id);
create policy "Insert own payment"
  on public.payments for insert with check (auth.uid() = user_id);

-- kyc_documents
create policy "Own KYC only"
  on public.kyc_documents for select using (auth.uid() = user_id);
create policy "Insert own KYC"
  on public.kyc_documents for insert with check (auth.uid() = user_id);
create policy "Update own KYC"
  on public.kyc_documents for update using (auth.uid() = user_id);

-- reviews
create policy "Anyone can read reviews"
  on public.reviews for select using (true);
create policy "Auth users can insert reviews"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- notifications
create policy "Own notifications only"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- ── Migrations (run these if you already applied schema) ──
-- alter table public.payments add column if not exists paid_at timestamptz;
-- alter table public.kyc_documents add column if not exists cin_recto_url text;
-- alter table public.kyc_documents add column if not exists cin_verso_url text;
-- alter table public.kyc_documents add column if not exists selfie_url text;

-- ── Seed: sample listings (optional, comment out for prod) ──
-- You can remove this block once you have real users
insert into public.listings (id, user_id, from_city, to_city, departure_date, available_weight, price_per_kg, description, is_international)
select
  uuid_generate_v4(),
  (select id from public.profiles limit 1),
  from_city, to_city, departure_date::date, weight, price, description, is_intl
from (values
  ('Paris','Alger','2026-04-25',15,350,'Voyage direct Paris→Alger, colis soigné garanti.',true),
  ('Alger','Oran','2026-04-22',8,180,'Trajet quotidien Alger-Oran.',false),
  ('Lyon','Alger','2026-04-28',20,320,'Transport sécurisé Lyon→Alger.',true),
  ('Alger','Constantine','2026-04-20',10,150,'Départ le matin, livraison le soir.',false),
  ('Bruxelles','Alger','2026-05-01',12,380,'Vol direct Bruxelles→Alger.',true)
) as t(from_city,to_city,departure_date,weight,price,description,is_intl)
where exists (select 1 from public.profiles limit 1);
