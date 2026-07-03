import { unstable_noStore as noStore } from "next/cache";
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
    trackingEnabled: false,
  };
}

async function countPageViews(since?: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_page_view_count", {
    since_ts: since ?? null,
  });
  if (error) {
    console.error("analytics_page_view_count:", error.message);
    return 0;
  }
  return Number(data ?? 0);
}

async function getTodayStartBerlin(): Promise<string> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_today_start_berlin");
  if (error || !data) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }
  return String(data);
}

async function distinctSessions(since?: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_distinct_sessions", {
    since_ts: since ?? null,
  });
  if (error) {
    console.error("analytics_distinct_sessions:", error.message);
    return 0;
  }
  return Number(data ?? 0);
}

async function fetchDailyStats(days: number): Promise<DailyStat[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_daily_stats", { days_count: days });
  if (error) {
    console.error("analytics_daily_stats:", error.message);
    return [];
  }
  return ((data ?? []) as { day: string; views: number; visitors: number }[]).map((row) => ({
    date: row.day,
    views: Number(row.views),
    visitors: Number(row.visitors),
  }));
}

async function fetchTopPages(): Promise<TopPage[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_top_pages", { limit_count: 10 });
  if (error) {
    console.error("analytics_top_pages:", error.message);
    return [];
  }
  return ((data ?? []) as { path: string; views: number }[]).map((row) => ({
    path: row.path,
    views: Number(row.views),
  }));
}

export async function fetchAdminAnalyticsDashboard(): Promise<AdminAnalyticsDashboard> {
  noStore();

  if (!isSupabaseConfigured()) return emptyDashboard();

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
      trackingEnabled: true,
    };
  } catch (err) {
    console.error("fetchAdminAnalyticsDashboard:", err);
    return emptyDashboard();
  }
}
