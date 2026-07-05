export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export interface PageViewPayload {
  path: string;
  referrer?: string | null;
  sessionId: string;
}

export interface DailyStat {
  date: string;
  views: number;
  visitors: number;
}

export interface TopPage {
  path: string;
  views: number;
}

export interface VisitorStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
}

export interface PageViewStats {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
}

export interface BookingStats {
  total: number;
  new: number;
  confirmed: number;
}

export interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
}

export interface BreakdownRow {
  label: string;
  views: number;
  visitors: number;
}

export interface LiveStats {
  viewsToday: number;
  visitorsToday: number;
  viewsLastHour: number;
  visitorsLastHour: number;
}

export interface HourlyStat {
  hour: number;
  views: number;
  visitors: number;
}

export interface ReferrerRow {
  referrer: string;
  views: number;
}

export interface AdminAnalyticsDashboard {
  visitors: VisitorStats;
  pageViews: PageViewStats;
  topPages: TopPage[];
  chart7Days: DailyStat[];
  chart30Days: DailyStat[];
  bookings: BookingStats;
  reviews: ReviewStats;
  galleryCount: number;
  postsCount: number;
  servicesCount: number;
  faqsCount: number;
  trackingEnabled: boolean;
  trackingTableReady: boolean;
}

export interface FullAnalyticsDashboard extends AdminAnalyticsDashboard {
  referrers: ReferrerRow[];
  devices: BreakdownRow[];
  browsers: BreakdownRow[];
  operatingSystems: BreakdownRow[];
  live: LiveStats;
  chartTodayHourly: HourlyStat[];
}
