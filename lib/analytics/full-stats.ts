import { unstable_noStore as noStore } from "next/cache";
import { fetchAdminAnalyticsDashboard } from "./stats";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type {
  BreakdownRow,
  FullAnalyticsDashboard,
  HourlyStat,
  LiveStats,
  ReferrerRow,
} from "./types";

function emptyLive(): LiveStats {
  return { viewsToday: 0, visitorsToday: 0, viewsLastHour: 0, visitorsLastHour: 0 };
}

async function fetchReferrers(): Promise<ReferrerRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_top_referrers", { limit_count: 10 });
  if (error) {
    console.error("analytics_top_referrers:", error.message);
    return [];
  }
  return ((data ?? []) as { referrer: string; views: number }[]).map((row) => ({
    referrer: row.referrer,
    views: Number(row.views),
  }));
}

async function fetchDevices(): Promise<BreakdownRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_device_breakdown");
  if (error) {
    console.error("analytics_device_breakdown:", error.message);
    return [];
  }
  return ((data ?? []) as { device_type: string; views: number; visitors: number }[]).map((row) => ({
    label: row.device_type,
    views: Number(row.views),
    visitors: Number(row.visitors),
  }));
}

async function fetchBrowsers(): Promise<BreakdownRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_browser_breakdown", { limit_count: 10 });
  if (error) {
    console.error("analytics_browser_breakdown:", error.message);
    return [];
  }
  return ((data ?? []) as { browser: string; views: number; visitors: number }[]).map((row) => ({
    label: row.browser,
    views: Number(row.views),
    visitors: Number(row.visitors),
  }));
}

async function fetchOs(): Promise<BreakdownRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_os_breakdown", { limit_count: 10 });
  if (error) {
    console.error("analytics_os_breakdown:", error.message);
    return [];
  }
  return ((data ?? []) as { os: string; views: number; visitors: number }[]).map((row) => ({
    label: row.os,
    views: Number(row.views),
    visitors: Number(row.visitors),
  }));
}

async function fetchLiveStats(): Promise<LiveStats> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_live_stats");
  if (error) {
    console.error("analytics_live_stats:", error.message);
    return emptyLive();
  }
  const row = (data as { views_today: number; visitors_today: number; views_last_hour: number; visitors_last_hour: number }[])?.[0];
  if (!row) return emptyLive();
  return {
    viewsToday: Number(row.views_today ?? 0),
    visitorsToday: Number(row.visitors_today ?? 0),
    viewsLastHour: Number(row.views_last_hour ?? 0),
    visitorsLastHour: Number(row.visitors_last_hour ?? 0),
  };
}

async function fetchHourlyToday(): Promise<HourlyStat[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc("analytics_hourly_today");
  if (error) {
    console.error("analytics_hourly_today:", error.message);
    return [];
  }
  return ((data ?? []) as { hour: number; views: number; visitors: number }[]).map((row) => ({
    hour: Number(row.hour),
    views: Number(row.views),
    visitors: Number(row.visitors),
  }));
}

export async function fetchFullAnalyticsDashboard(): Promise<FullAnalyticsDashboard> {
  noStore();
  const base = await fetchAdminAnalyticsDashboard();

  if (!base.trackingEnabled || !base.trackingTableReady) {
    return {
      ...base,
      referrers: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      live: emptyLive(),
      chartTodayHourly: [],
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ...base,
      referrers: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      live: emptyLive(),
      chartTodayHourly: [],
    };
  }

  try {
    const [referrers, devices, browsers, operatingSystems, live, chartTodayHourly] = await Promise.all([
      fetchReferrers(),
      fetchDevices(),
      fetchBrowsers(),
      fetchOs(),
      fetchLiveStats(),
      fetchHourlyToday(),
    ]);

    return {
      ...base,
      referrers,
      devices,
      browsers,
      operatingSystems,
      live,
      chartTodayHourly,
    };
  } catch (err) {
    console.error("fetchFullAnalyticsDashboard:", err);
    return {
      ...base,
      referrers: [],
      devices: [],
      browsers: [],
      operatingSystems: [],
      live: emptyLive(),
      chartTodayHourly: [],
    };
  }
}

export function analyticsToCsv(data: FullAnalyticsDashboard): string {
  const lines: string[] = ["# Panda-Bande Analytics Export", `exported_at,${new Date().toISOString()}`, ""];

  lines.push("## Besucher");
  lines.push("metric,value");
  lines.push(`total,${data.visitors.total}`);
  lines.push(`today,${data.visitors.today}`);
  lines.push(`last_7_days,${data.visitors.last7Days}`);
  lines.push(`last_30_days,${data.visitors.last30Days}`);
  lines.push("");

  lines.push("## Seitenaufrufe");
  lines.push("metric,value");
  lines.push(`total,${data.pageViews.total}`);
  lines.push(`today,${data.pageViews.today}`);
  lines.push(`last_7_days,${data.pageViews.last7Days}`);
  lines.push(`last_30_days,${data.pageViews.last30Days}`);
  lines.push("");

  lines.push("## Top Seiten");
  lines.push("path,views");
  for (const page of data.topPages) {
    lines.push(`"${page.path.replace(/"/g, '""')}",${page.views}`);
  }
  lines.push("");

  lines.push("## Referrer");
  lines.push("referrer,views");
  for (const row of data.referrers) {
    lines.push(`"${row.referrer.replace(/"/g, '""')}",${row.views}`);
  }

  return lines.join("\n");
}
