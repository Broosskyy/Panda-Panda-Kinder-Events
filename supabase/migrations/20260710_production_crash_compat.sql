-- Production crash compatibility (idempotent, no data deletion)
-- Run in Supabase SQL Editor if public site fails after CMS/CRM deploy.

-- Site settings store (key-value JSON)
create table if not exists site_settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- CMS services: extended fields for detail modals (public website sprint)
alter table cms_services add column if not exists detail_text text default '';
alter table cms_services add column if not exists image_url text default '';
alter table cms_services add column if not exists button_label text default 'Mehr erfahren';

-- Analytics page_views (public track API — must not break site if missing)
create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null default '/',
  referrer text,
  user_agent text,
  session_id text,
  device_type text,
  browser text,
  os text
);

create index if not exists idx_page_views_created_at on page_views(created_at desc);
create index if not exists idx_page_views_path on page_views(path);
