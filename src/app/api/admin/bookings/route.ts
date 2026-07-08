import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { getSupabaseAdmin, type BookingStatus } from "@/lib/supabase/admin";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { assessBookingDeleteBlock } from "@/lib/admin/booking-lifecycle";
import { runSafeApi } from "@/lib/api/safe-route";

const VALID_STATUSES: BookingStatus[] = [
  "new",
  "contacted",
  "confirmed",
  "declined",
  "cancelled",
  "completed",
];

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(VALID_STATUSES as [BookingStatus, ...BookingStatus[]]).optional(),
  admin_notes: z.string().nullable().optional(),
  action: z.enum(["archive", "unarchive"]).optional(),
});

export async function GET(request: Request) {
  return runSafeApi(async () => {
    const authError = await requireAdmin("crm:read");
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") ?? "active";

    const supabase = getSupabaseAdmin();
    let query = supabase.from("booking_requests").select("*").order("created_at", { ascending: false });

    if (view === "active") {
      query = query.is("archived_at", null);
    } else if (view === "archived") {
      query = query.not("archived_at", "is", null);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Fehler beim Laden." }, { status: 500 });
    }

    return NextResponse.json({ bookings: data ?? [] });
  }, "Anfragen konnten nicht geladen werden.");
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const { id, status, admin_notes, action } = parsed.data;

  if (action === "archive" || action === "unarchive") {
    const authError = await requireAdmin("inquiries:write");
    if (authError) return authError;

    const supabase = getSupabaseAdmin();
    const { data: before } = await supabase.from("booking_requests").select("*").eq("id", id).maybeSingle();

    const archived_at = action === "archive" ? new Date().toISOString() : null;
    const { error } = await supabase.from("booking_requests").update({ archived_at }).eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Archivierung fehlgeschlagen." }, { status: 500 });
    }

    const ctx = await getAdminContext();
    await writeAuditLogFromRequest(ctx, request, {
      action: action === "archive" ? "archive" : "unarchive",
      area: "inquiries",
      entityId: id,
      before: before ?? undefined,
      after: { archived_at },
    });

    return NextResponse.json({ success: true });
  }

  const authError = await requireAdmin("inquiries:write");
  if (authError) return authError;

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (admin_notes !== undefined) updates.admin_notes = admin_notes;

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Keine Updates." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: before } = await supabase.from("booking_requests").select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from("booking_requests").update(updates).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 });
  }

  const ctx = await getAdminContext();
  await writeAuditLogFromRequest(ctx, request, {
    action: "update",
    area: "inquiries",
    entityId: id,
    before: before ?? undefined,
    after: updates,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("inquiries:delete");
  if (authError) return authError;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : null;
  if (!id) {
    return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });
  }

  const block = await assessBookingDeleteBlock(id);
  if (block.blocked) {
    return NextResponse.json({ error: block.reason ?? "Löschen nicht möglich." }, { status: 409 });
  }

  const supabase = getSupabaseAdmin();
  const { data: before } = await supabase.from("booking_requests").select("*").eq("id", id).maybeSingle();
  const { error } = await supabase.from("booking_requests").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  }

  const ctx = await getAdminContext();
  await writeAuditLogFromRequest(ctx, request, {
    action: "delete",
    area: "inquiries",
    entityId: id,
    before: before ?? undefined,
    success: true,
  });

  return NextResponse.json({ success: true });
}
