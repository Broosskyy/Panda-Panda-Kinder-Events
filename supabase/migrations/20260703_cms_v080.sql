-- Panda-Bande CMS v0.8.0 Migration
-- Bestehende Daten bleiben erhalten. In Supabase SQL Editor ausführen.

-- ─── Booking requests: Notizen + Status Abgesagt ───────────────────────────
alter table booking_requests add column if not exists admin_notes text;

alter table booking_requests drop constraint if exists booking_requests_status_check;
alter table booking_requests add constraint booking_requests_status_check
  check (status in ('new', 'contacted', 'confirmed', 'declined', 'cancelled', 'completed'));

-- ─── Reviews: Bilder, Antwort, Verifiziert ─────────────────────────────────
alter table reviews add column if not exists profile_image_url text;
alter table reviews add column if not exists event_image_url text;
alter table reviews add column if not exists admin_reply text;
alter table reviews add column if not exists verified boolean not null default false;

-- ─── Site Settings (key-value JSON) ────────────────────────────────────────
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ─── CMS Services ──────────────────────────────────────────────────────────
create table if not exists cms_services (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  icon_key text not null default 'Star',
  title text not null,
  description text not null,
  sort_order integer not null default 0,
  visible boolean not null default true
);

create index if not exists idx_cms_services_sort on cms_services(sort_order);
create index if not exists idx_cms_services_visible on cms_services(visible);

-- ─── CMS FAQ ───────────────────────────────────────────────────────────────
create table if not exists cms_faqs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  visible boolean not null default true
);

create index if not exists idx_cms_faqs_sort on cms_faqs(sort_order);

-- ─── Gallery ───────────────────────────────────────────────────────────────
create table if not exists gallery_images (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  storage_path text not null,
  title text not null default '',
  alt_text text not null default '',
  category text not null default 'allgemein',
  sort_order integer not null default 0,
  visible boolean not null default true
);

create index if not exists idx_gallery_images_sort on gallery_images(sort_order);
create index if not exists idx_gallery_images_visible on gallery_images(visible);

-- ─── Blog Posts / Beiträge ─────────────────────────────────────────────────
create table if not exists cms_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  subtitle text not null default '',
  content text not null default '',
  hero_image_path text,
  category text not null default 'aktuelles',
  slug text not null unique,
  published boolean not null default false,
  published_at timestamptz
);

create index if not exists idx_cms_posts_published on cms_posts(published, published_at desc);
create index if not exists idx_cms_posts_slug on cms_posts(slug);

-- ─── RLS: Kein öffentlicher DB-Zugriff ─────────────────────────────────────
alter table site_settings enable row level security;
alter table cms_services enable row level security;
alter table cms_faqs enable row level security;
alter table gallery_images enable row level security;
alter table cms_posts enable row level security;

create policy "No public access on site_settings" on site_settings for all using (false);
create policy "No public access on cms_services" on cms_services for all using (false);
create policy "No public access on cms_faqs" on cms_faqs for all using (false);
create policy "No public access on gallery_images" on gallery_images for all using (false);
create policy "No public access on cms_posts" on cms_posts for all using (false);

-- ─── Storage Buckets (im Supabase Dashboard anlegen falls nicht vorhanden) ─
-- gallery      — öffentlich lesbar
-- reviews      — öffentlich lesbar
-- site-assets  — öffentlich lesbar
-- Erlaubte Typen: image/jpeg, image/png, image/webp — max 5 MB (in API validiert)
