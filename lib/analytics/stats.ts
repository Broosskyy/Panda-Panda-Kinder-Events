import { unstable_noStore as noStore } from "next/cache";
import { berlinTodayStartIso } from "@/lib/analytics/berlin-time";
import { fetchCrmDashboardStats } from "@/lib/crm/events";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { AdminAnalyticsDashboard, DailyStat, TopPage } from "./types";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function emptyDashboard(): AdminAnalyticsDashboard {
  return {
    visitors: { total: 0, today: 0, last7Days: 0, last30Days: 0 },
    pageViews: { total: 0, today: 0, last7Days: 0, last30Days: 0 },
    topPages: [],
    chart7Days: [],
    chart30Days: [],
    bookings: { total: 0, new: 0, confirmed: 0 },
    reviews: { total: 0, pending: 0, approved: 0 },
    galleryCount: 0,
    postsCount: 0,
    servicesCount: 0,
    faqsCount: 0,
    trackingEnabled: false,
    trackingTableReady: false,
    crm: { customersCount: 0, openQuotesCount: 0, openInvoicesCount: 0, revenueCents: 0 },
  };
}

async function isPageViewsTableReady(): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("page_views").select("id", { count: "exact", head: true });
  return !error;
}

async function countPageViewsRpc(since?: string): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_page_view_count", {
    since_ts: since ?? null,
  });
  if (error) {
    console.error("analytics_page_view_count:", error.message);
    return null;
  }
  return Number(data ?? 0);
}

async function countPageViewsDirect(since?: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("page_views").select("id", { count: "exact", head: true });
  if (since) query = query.gte("created_at", since);
  const { count, error } = await query;
  if (error) {
    console.error("countPageViewsDirect:", error.message);
    return 0;
  }
  return count ?? 0;
}

async function countPageViews(since?: string): Promise<number> {
  const rpc = await countPageViewsRpc(since);
  if (rpc !== null) return rpc;
  return countPageViewsDirect(since);
}

async function getTodayStartBerlin(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_today_start_berlin");
  if (error || !data) {
    return berlinTodayStartIso();
  }
  return String(data);
}

async function distinctSessionsRpc(since?: string): Promise<number | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_distinct_sessions", {
    since_ts: since ?? null,
  });
  if (error) {
    console.error("analytics_distinct_sessions:", error.message);
    return null;
  }
  return Number(data ?? 0);
}

async function distinctSessionsDirect(since?: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("page_views").select("session_id");
  if (since) query = query.gte("created_at", since);
  const { data, error } = await query;
  if (error) {
    console.error("distinctSessionsDirect:", error.message);
    return 0;
  }
  return new Set((data ?? []).map((row) => row.session_id)).size;
}

async function distinctSessions(since?: string): Promise<number> {
  const rpc = await distinctSessionsRpc(since);
  if (rpc !== null) return rpc;
  return distinctSessionsDirect(since);
}

function aggregateDailyStats(
  rows: { created_at: string; session_id: string }[],
  days: number,
): DailyStat[] {
  const byDay = new Map<string, { views: number; sessions: Set<string> }>();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

  for (const row of rows) {
    const ts = new Date(row.created_at).getTime();
    if (ts < cutoff) continue;
    const day = new Date(row.created_at).toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });
    const entry = byDay.get(day) ?? { views: 0, sessions: new Set<string>() };
    entry.views += 1;
    entry.sessions.add(row.session_id);
    byDay.set(day, entry);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({
      date,
      views: stats.views,
      visitors: stats.sessions.size,
    }));
}

function aggregateTopPages(rows: { path: string }[], limit = 10): TopPage[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.path, (counts.get(row.path) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, views]) => ({ path, views }));
}

async function fetchDailyStatsRpc(days: number): Promise<DailyStat[] | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_daily_stats", { days_count: days });
  if (error) {
    console.error("analytics_daily_stats:", error.message);
    return null;
  }
  return ((data ?? []) as { day: string; views: number; visitors: number }[]).map((row) => ({
    date: row.day,
    views: Number(row.views),
    visitors: Number(row.visitors),
  }));
}

async function fetchDailyStatsDirect(days: number): Promise<DailyStat[]> {
  const supabase = getSupabaseAdmin();
  const since = daysAgoIso(days);
  const { data, error } = await supabase
    .from("page_views")
    .select("created_at, session_id")
    .gte("created_at", since);
  if (error) {
    console.error("fetchDailyStatsDirect:", error.message);
    return [];
  }
  return aggregateDailyStats(data ?? [], days);
}

async function fetchDailyStats(days: number): Promise<DailyStat[]> {
  const rpc = await fetchDailyStatsRpc(days);
  if (rpc !== null) return rpc;
  return fetchDailyStatsDirect(days);
}

async function fetchTopPagesRpc(): Promise<TopPage[] | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_top_pages", { limit_count: 10 });
  if (error) {
    console.error("analytics_top_pages:", error.message);
    return null;
  }
  return ((data ?? []) as { path: string; views: number }[]).map((row) => ({
    path: row.path,
    views: Number(row.views),
  }));
}

async function fetchTopPagesDirect(): Promise<TopPage[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("page_views").select("path");
  if (error) {
    console.error("fetchTopPagesDirect:", error.message);
    return [];
  }
  return aggregateTopPages(data ?? []);
}

async function fetchTopPages(): Promise<TopPage[]> {
  const rpc = await fetchTopPagesRpc();
  if (rpc !== null) return rpc;
  return fetchTopPagesDirect();
}

export async function fetchAdminAnalyticsDashboard(): Promise<AdminAnalyticsDashboard> {
  noStore();

  if (!isSupabaseConfigured()) return emptyDashboard();

  const tableReady = await isPageViewsTableReady();
  const supabase = getSupabaseAdmin();
  const todayStart = await getTodayStartBerlin();
  const sevenDaysAgo = daysAgoIso(7);
  const thirtyDaysAgo = daysAgoIso(30);

  try {
    const [
      visitorsTotal,
      visitorsToday,
      visitors7,
      visitors30,
      viewsTotal,
      viewsToday,
      views7,
      views30,
      topPages,
      chart7Days,
      chart30Days,
      bookingsTotal,
      bookingsNew,
      bookingsConfirmed,
      reviewsTotal,
      reviewsPending,
      reviewsApproved,
      galleryCount,
      postsCount,
      servicesCount,
      faqsCount,
      crm,
    ] = await Promise.all([
      distinctSessions(),
      distinctSessions(todayStart),
      distinctSessions(sevenDaysAgo),
      distinctSessions(thirtyDaysAgo),
      countPageViews(),
      countPageViews(todayStart),
      countPageViews(sevenDaysAgo),
      countPageViews(thirtyDaysAgo),
      fetchTopPages(),
      fetchDailyStats(7),
      fetchDailyStats(30),
      supabase.from("booking_requests").select("id", { count: "exact", head: true }),
      supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "confirmed"),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", true),
      supabase.from("gallery_images").select("id", { count: "exact", head: true }),
      supabase.from("cms_posts").select("id", { count: "exact", head: true }),
      supabase.from("cms_services").select("id", { count: "exact", head: true }),
      supabase.from("cms_faqs").select("id", { count: "exact", head: true }),
      fetchCrmDashboardStats().catch(() => ({
        customersCount: 0,
        openQuotesCount: 0,
        openInvoicesCount: 0,
        revenueCents: 0,
      })),
    ]);

    return {
      visitors: {
        total: visitorsTotal,
        today: visitorsToday,
        last7Days: visitors7,
        last30Days: visitors30,
      },
      pageViews: {
        total: viewsTotal,
        today: viewsToday,
        last7Days: views7,
        last30Days: views30,
      },
      topPages,
      chart7Days,
      chart30Days,
      bookings: {
        total: bookingsTotal.count ?? 0,
        new: bookingsNew.count ?? 0,
        confirmed: bookingsConfirmed.count ?? 0,
      },
      reviews: {
        total: reviewsTotal.count ?? 0,
        pending: reviewsPending.count ?? 0,
        approved: reviewsApproved.count ?? 0,
      },
      galleryCount: galleryCount.count ?? 0,
      postsCount: postsCount.count ?? 0,
      servicesCount: servicesCount.count ?? 0,
      faqsCount: faqsCount.count ?? 0,
      trackingEnabled: true,
      trackingTableReady: tableReady,
      crm,
    };
  } catch (err) {
    console.error("fetchAdminAnalyticsDashboard:", err);
    return { ...emptyDashboard(), trackingEnabled: true, trackingTableReady: tableReady };
  }
}
