import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

export type AdminNotificationType = "booking" | "review" | "customer" | "email";

export interface AdminNotificationItem {
  id: string;
  type: AdminNotificationType;
  title: string;
  subtitle: string;
  href: string;
  createdAt: string;
}

export interface AdminNotificationCounts {
  bookings: number;
  reviews: number;
  customers: number;
  emails: number;
  total: number;
}

export interface AdminNotificationPeriodCounts {
  bookingsToday: number;
  bookingsWeek: number;
  bookingsTotal: number;
  reviewsToday: number;
  reviewsWeek: number;
  reviewsPending: number;
  reviewsTotal: number;
  customersLeads: number;
  emailsFailed: number;
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export async function fetchAdminNotificationData(): Promise<{
  counts: AdminNotificationCounts;
  period: AdminNotificationPeriodCounts;
  items: AdminNotificationItem[];
}> {
  noStore();

  const empty = {
    counts: { bookings: 0, reviews: 0, customers: 0, emails: 0, total: 0 },
    period: {
      bookingsToday: 0,
      bookingsWeek: 0,
      bookingsTotal: 0,
      reviewsToday: 0,
      reviewsWeek: 0,
      reviewsPending: 0,
      reviewsTotal: 0,
      customersLeads: 0,
      emailsFailed: 0,
    },
    items: [] as AdminNotificationItem[],
  };

  if (!isSupabaseConfigured()) return empty;

  const supabase = getSupabaseAdmin();
  const todayStart = startOfTodayIso();
  const weekStart = daysAgoIso(7);

  try {
    const [
      bookingsNew,
      bookingsToday,
      bookingsWeek,
      bookingsTotal,
      reviewsPending,
      reviewsToday,
      reviewsWeek,
      reviewsTotal,
      customersLeads,
      emailsFailed,
      recentBookings,
      recentReviews,
      recentLeads,
      recentFailedEmails,
    ] = await Promise.all([
      supabase.from("booking_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("booking_requests").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("booking_requests").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("booking_requests").select("id", { count: "exact", head: true }),
      supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", false),
      supabase.from("reviews").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("reviews").select("id", { count: "exact", head: true }).gte("created_at", weekStart),
      supabase.from("reviews").select("id", { count: "exact", head: true }),
      supabase.from("crm_customers").select("id", { count: "exact", head: true }).eq("status", "lead"),
      supabase.from("email_logs").select("id", { count: "exact", head: true }).eq("status", "failed").gte("created_at", weekStart),
      supabase
        .from("booking_requests")
        .select("id, name, event_type, created_at")
        .eq("status", "new")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("reviews")
        .select("id, name, event_type, created_at, approved")
        .eq("approved", false)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("crm_customers")
        .select("id, name, created_at")
        .eq("status", "lead")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("email_logs")
        .select("id, subject, recipient, created_at")
        .eq("status", "failed")
        .gte("created_at", weekStart)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const counts = {
      bookings: bookingsNew.count ?? 0,
      reviews: reviewsPending.count ?? 0,
      customers: customersLeads.count ?? 0,
      emails: emailsFailed.count ?? 0,
      total: 0,
    };
    counts.total = counts.bookings + counts.reviews + counts.customers + counts.emails;

    const period: AdminNotificationPeriodCounts = {
      bookingsToday: bookingsToday.count ?? 0,
      bookingsWeek: bookingsWeek.count ?? 0,
      bookingsTotal: bookingsTotal.count ?? 0,
      reviewsToday: reviewsToday.count ?? 0,
      reviewsWeek: reviewsWeek.count ?? 0,
      reviewsPending: reviewsPending.count ?? 0,
      reviewsTotal: reviewsTotal.count ?? 0,
      customersLeads: customersLeads.count ?? 0,
      emailsFailed: emailsFailed.count ?? 0,
    };

    const items: AdminNotificationItem[] = [];

    for (const row of recentBookings.data ?? []) {
      items.push({
        id: `booking-${row.id}`,
        type: "booking",
        title: row.name,
        subtitle: `Neue Anfrage · ${row.event_type}`,
        href: "/admin/anfragen",
        createdAt: row.created_at,
      });
    }

    for (const row of recentReviews.data ?? []) {
      items.push({
        id: `review-${row.id}`,
        type: "review",
        title: row.name,
        subtitle: `Bewertung wartet · ${row.event_type}`,
        href: "/admin/bewertungen",
        createdAt: row.created_at,
      });
    }

    for (const row of recentLeads.data ?? []) {
      items.push({
        id: `customer-${row.id}`,
        type: "customer",
        title: row.name,
        subtitle: "Neuer Kontakt · Interessent",
        href: "/admin/kunden",
        createdAt: row.created_at,
      });
    }

    for (const row of recentFailedEmails.data ?? []) {
      items.push({
        id: `email-${row.id}`,
        type: "email",
        title: row.subject,
        subtitle: `E-Mail fehlgeschlagen · ${row.recipient}`,
        href: "/admin/emails",
        createdAt: row.created_at,
      });
    }

    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { counts, period, items: items.slice(0, 12) };
  } catch (err) {
    console.error("fetchAdminNotificationData:", err);
    return empty;
  }
}
