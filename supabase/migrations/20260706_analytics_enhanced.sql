-- Analytics Sprint 2 — enhanced breakdowns, live stats, browser/OS columns

alter table page_views add column if not exists browser text;
alter table page_views add column if not exists os text;

create index if not exists idx_page_views_browser on page_views(browser);
create index if not exists idx_page_views_os on page_views(os);
create index if not exists idx_page_views_device on page_views(device_type);

-- Top referrers (external host only, anonymized path stored)
create or replace function analytics_top_referrers(limit_count int default 10)
returns table(referrer text, views bigint)
language sql
stable
as $$
  select coalesce(nullif(referrer, ''), '(direkt)') as referrer, count(*)::bigint as views
  from page_views
  group by 1
  order by views desc
  limit limit_count;
$$;

-- Device breakdown
create or replace function analytics_device_breakdown()
returns table(device_type text, views bigint, visitors bigint)
language sql
stable
as $$
  select
    coalesce(device_type, 'unknown') as device_type,
    count(*)::bigint as views,
    count(distinct session_id)::bigint as visitors
  from page_views
  group by 1
  order by views desc;
$$;

-- Browser breakdown
create or replace function analytics_browser_breakdown(limit_count int default 10)
returns table(browser text, views bigint, visitors bigint)
language sql
stable
as $$
  select
    coalesce(nullif(browser, ''), 'Unbekannt') as browser,
    count(*)::bigint as views,
    count(distinct session_id)::bigint as visitors
  from page_views
  group by 1
  order by views desc
  limit limit_count;
$$;

-- OS breakdown
create or replace function analytics_os_breakdown(limit_count int default 10)
returns table(os text, views bigint, visitors bigint)
language sql
stable
as $$
  select
    coalesce(nullif(os, ''), 'Unbekannt') as os,
    count(*)::bigint as views,
    count(distinct session_id)::bigint as visitors
  from page_views
  group by 1
  order by views desc
  limit limit_count;
$$;

-- Live stats: today + last hour
create or replace function analytics_live_stats()
returns table(
  views_today bigint,
  visitors_today bigint,
  views_last_hour bigint,
  visitors_last_hour bigint
)
language sql
stable
as $$
  with today_start as (
    select (date_trunc('day', now() at time zone 'Europe/Berlin') at time zone 'Europe/Berlin') as ts
  ),
  hour_start as (
    select now() - interval '1 hour' as ts
  )
  select
    (select count(*)::bigint from page_views, today_start where created_at >= today_start.ts),
    (select count(distinct session_id)::bigint from page_views, today_start where created_at >= today_start.ts),
    (select count(*)::bigint from page_views, hour_start where created_at >= hour_start.ts),
    (select count(distinct session_id)::bigint from page_views, hour_start where created_at >= hour_start.ts);
$$;

-- Hourly stats for today (Berlin)
create or replace function analytics_hourly_today()
returns table(hour int, views bigint, visitors bigint)
language sql
stable
as $$
  select
    extract(hour from created_at at time zone 'Europe/Berlin')::int as hour,
    count(*)::bigint as views,
    count(distinct session_id)::bigint as visitors
  from page_views
  where created_at >= (date_trunc('day', now() at time zone 'Europe/Berlin') at time zone 'Europe/Berlin')
  group by 1
  order by 1;
$$;

-- Revoke public access (RC2 security pattern)
revoke all on function analytics_top_referrers(int) from public, anon, authenticated;
revoke all on function analytics_device_breakdown() from public, anon, authenticated;
revoke all on function analytics_browser_breakdown(int) from public, anon, authenticated;
revoke all on function analytics_os_breakdown(int) from public, anon, authenticated;
revoke all on function analytics_live_stats() from public, anon, authenticated;
revoke all on function analytics_hourly_today() from public, anon, authenticated;
