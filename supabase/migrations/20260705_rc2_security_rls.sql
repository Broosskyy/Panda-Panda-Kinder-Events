-- RC2 Security: restrict analytics RPC functions to service role only
-- Run in Supabase SQL Editor on production

revoke all on function analytics_distinct_sessions(timestamptz) from public;
revoke all on function analytics_daily_stats(int) from public;
revoke all on function analytics_top_pages(int) from public;
revoke all on function analytics_page_view_count(timestamptz) from public;
revoke all on function analytics_today_start_berlin() from public;

revoke all on function analytics_distinct_sessions(timestamptz) from anon, authenticated;
revoke all on function analytics_daily_stats(int) from anon, authenticated;
revoke all on function analytics_top_pages(int) from anon, authenticated;
revoke all on function analytics_page_view_count(timestamptz) from anon, authenticated;
revoke all on function analytics_today_start_berlin() from anon, authenticated;

-- RLS reminder: all CMS/booking/review tables use deny-all policies for anon/authenticated.
-- Public website access is exclusively via Next.js API routes with service role (server-side only).
