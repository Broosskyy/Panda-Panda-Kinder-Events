import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hasPermission } from "@/lib/auth/permissions";
import { FIRST_STEPS, type FirstStepsResponse } from "@/lib/admin/first-steps";
import { fetchSiteSettings } from "@/lib/cms/data";

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const ctx = await import("@/lib/admin-route").then((m) => m.getAdminContext());
  const permissions = ctx?.permissions ?? [];

  const visible = FIRST_STEPS.filter((step) => hasPermission(permissions, step.permission));
  const supabase = getSupabaseAdmin();

  const [
    galleryRes,
    bookingsRes,
    quotesRes,
    invoicesRes,
    reviewsRes,
    teamRes,
    settings,
    emailTestRes,
  ] = await Promise.all([
    supabase.from("gallery_images").select("id", { count: "exact", head: true }),
    supabase.from("booking_requests").select("id", { count: "exact", head: true }),
    supabase.from("crm_quotes").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("crm_invoices").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("reviews").select("id", { count: "exact", head: true }).eq("approved", true),
    supabase.from("team_members").select("id", { count: "exact", head: true }).eq("active", true).eq("archived", false),
    fetchSiteSettings().catch(() => null),
    supabase.from("email_logs").select("id", { count: "exact", head: true }).eq("status", "sent").limit(1),
  ]);

  const detectors: Record<string, boolean> = {
    content: Boolean(settings?.business?.companyName?.trim()),
    gallery: (galleryRes.count ?? 0) > 0,
    inquiries: (bookingsRes.count ?? 0) > 0,
    quotes: (quotesRes.count ?? 0) > 0,
    invoices: (invoicesRes.count ?? 0) > 0,
    reviews: (reviewsRes.count ?? 0) > 0,
    team: (teamRes.count ?? 0) > 0,
    hours: Boolean(settings?.contact?.openingHours?.trim()),
    email: (emailTestRes.count ?? 0) > 0,
  };

  const steps = visible.map((step) => {
    const autoDetected = detectors[step.id] ?? false;
    return {
      ...step,
      completed: autoDetected,
      autoDetected,
    };
  });

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const payload: FirstStepsResponse = {
    steps,
    completedCount,
    totalCount,
    percent,
  };

  return NextResponse.json(payload);
}
