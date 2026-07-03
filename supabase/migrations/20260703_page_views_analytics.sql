-- Panda-Bande Analytics v0.8.2
-- Anonymes, cookie-freies Seiten-Tracking (keine IP, keine personenbezogenen Daten)

create table if not exists page_views (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  path text not null,
  referrer text,
  user_agent text,
  device_type text not null default 'unknown',
  session_id text not null
);

create index if not exists idx_page_views_created_at on page_views(created_at desc);
create index if not exists idx_page_views_path on page_views(path);
create index if not exists idx_page_views_session on page_views(session_id);

alter table page_views enable row level security;
create policy "No public access on page_views" on page_views for all using (false);

-- Distinct Besucher (Sessions) seit optionalem Zeitpunkt
create or replace function analytics_distinct_sessions(since_ts timestamptz default null)
returns bigint
language sql
stable
as $$
  select count(distinct session_id)::bigint
  from page_views
  where since_ts is null or created_at >= since_ts;
$$;

-- Tägliche Statistik für Diagramme
create or replace function analytics_daily_stats(days_count int default 7)
returns table(day date, views bigint, visitors bigint)
language sql
stable
as $$
  select
    (created_at at time zone 'Europe/Berlin')::date as day,
    count(*)::bigint as views,
    count(distinct session_id)::bigint as visitors
  from page_views
  where created_at >= now() - (days_count || ' days')::interval
  group by day
  order by day;
$$;

-- Meistbesuchte Seiten
create or replace function analytics_top_pages(limit_count int default 10)
returns table(path text, views bigint)
language sql
stable
as $$
  select path, count(*)::bigint as views
  from page_views
  group by path
  order by views desc
  limit limit_count;
$$;

-- Seitenaufrufe zählen
create or replace function analytics_page_view_count(since_ts timestamptz default null)
returns bigint
language sql
stable
as $$
  select count(*)::bigint
  from page_views
  where since_ts is null or created_at >= since_ts;
$$;

-- Mitternacht heute (Europe/Berlin)
create or replace function analytics_today_start_berlin()
returns timestamptz
language sql
stable
as $$
  select (date_trunc('day', now() at time zone 'Europe/Berlin') at time zone 'Europe/Berlin');
$$;
