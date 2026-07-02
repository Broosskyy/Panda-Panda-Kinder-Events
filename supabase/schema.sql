-- Panda-Bande Kinderevents — Supabase Schema
-- In Supabase SQL Editor ausführen

create table if not exists booking_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text not null,
  event_type text not null,
  event_date date not null,
  event_time time not null,
  duration text,
  location text not null,
  children_count integer not null,
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'confirmed', 'declined', 'completed'))
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  event_type text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  text text not null,
  approved boolean not null default false
);

create index if not exists idx_booking_requests_status on booking_requests(status);
create index if not exists idx_booking_requests_created_at on booking_requests(created_at desc);
create index if not exists idx_reviews_approved on reviews(approved);
create index if not exists idx_reviews_created_at on reviews(created_at desc);

alter table booking_requests enable row level security;
alter table reviews enable row level security;

-- Kein öffentlicher Zugriff — alle Operationen über Server/API mit Service Role
create policy "No public access on booking_requests"
  on booking_requests for all
  using (false);

create policy "No public access on reviews"
  on reviews for all
  using (false);
