import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSupabaseAdmin, isSupabaseConfigured, type BookingStatus } from "@/lib/supabase/admin";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase nicht konfiguriert." }, { status: 503 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("booking_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 });
  }

  return NextResponse.json({ bookings: data ?? [] });
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const { id, status, admin_notes } = await request.json();

  const validStatuses: BookingStatus[] = [
    "new",
    "contacted",
    "confirmed",
    "declined",
    "cancelled",
    "completed",
  ];

  if (!id) {
    return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (status !== undefined) {
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Ungültiger Status." }, { status: 400 });
    }
    updates.status = status;
  }
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Keine Updates." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("booking_requests").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
