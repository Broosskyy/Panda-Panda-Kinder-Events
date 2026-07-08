import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { writeAuditLogFromRequest } from "@/lib/auth/audit";
import { cmsServicePatchSchema, cmsServiceSchema } from "@/lib/cms/admin-schemas";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { CMS_SAVE_SUCCESS_MESSAGE } from "@/lib/cms/messages";
import { revalidatePublicCms } from "@/lib/cms/revalidate";
import {
  ensureCmsServicesSeeded,
  getCmsServiceById,
  listCmsServicesAdmin,
  swapServiceSortOrder,
} from "@/lib/cms/services-db";
import type { CmsService } from "@/lib/cms/types";

const OK = { message: CMS_SAVE_SUCCESS_MESSAGE };

function dbRowFromInput(data: Record<string, unknown>) {
  return {
    ...data,
    detail_text: data.detail_text ?? "",
    image_url: data.image_url ?? "",
    button_label: data.button_label ?? "Mehr erfahren",
    button_link: data.button_link ?? "",
    category: data.category ?? "",
    price_from: data.price_from ?? "",
    highlights: data.highlights ?? [],
  };
}

function detectServiceAuditAction(
  before: CmsService | null,
  updates: Record<string, unknown>,
): string {
  if (!before) return "service_create";
  if ("image_url" in updates && updates.image_url !== before.image_url) return "service_image_change";
  if ("visible" in updates && updates.visible !== before.visible) {
    return updates.visible === false ? "service_archive" : "service_visibility_change";
  }
  if ("sort_order" in updates && updates.sort_order !== before.sort_order) return "service_sort_change";
  return "service_update";
}

export async function GET() {
  const authError = await requireAdmin("website:read");
  if (authError) return authError;

  try {
    const seed = await ensureCmsServicesSeeded();
    const services = await listCmsServicesAdmin();
    if (seed.seeded) {
      revalidatePublicCms();
    }
    return NextResponse.json({ services, meta: { seeded: seed.seeded, count: services.length } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin("website:write");
  if (authError) return authError;

  const body = await request.json();

  if (body.action === "reorder") {
    const { id, direction } = body as { id?: string; direction?: "up" | "down" };
    if (!id || (direction !== "up" && direction !== "down")) {
      return NextResponse.json({ error: "ID und Richtung erforderlich." }, { status: 400 });
    }
    try {
      await swapServiceSortOrder(id, direction);
      const ctx = await getAdminContext();
      await writeAuditLogFromRequest(ctx, request, {
        action: "service_sort_change",
        area: "cms_services",
        entityId: id,
        after: { direction },
      });
      revalidatePublicCms();
      return NextResponse.json({ success: true, ...OK });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Reihenfolge konnte nicht geändert werden.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const parsed = cmsServiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Leistungsdaten." }, { status: 400 });
  }

  const existing = await listCmsServicesAdmin();
  const nextSortOrder =
    typeof parsed.data.sort_order === "number" ? parsed.data.sort_order : existing.length;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_services")
    .insert({
      ...dbRowFromInput(parsed.data),
      sort_order: nextSortOrder,
      visible: parsed.data.visible ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("services POST:", error.message);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Eine Leistung mit diesem Titel existiert bereits." }, { status: 400 });
    }
    return NextResponse.json({ error: "Erstellen fehlgeschlagen." }, { status: 500 });
  }
  const ctx = await getAdminContext();
  await writeAuditLogFromRequest(ctx, request, {
    action: "service_create",
    area: "cms_services",
    entityId: data.id,
    after: { title: data.title },
  });
  revalidatePublicCms();
  return NextResponse.json({ service: data, ...OK });
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin("website:write");
  if (authError) return authError;

  const body = await request.json();
  const { id, ...rawUpdates } = body;
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const parsed = cmsServicePatchSchema.safeParse(rawUpdates);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Leistungsdaten." }, { status: 400 });
  }

  const before = await getCmsServiceById(id);
  const updates = dbRowFromInput(parsed.data);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("cms_services")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("services PATCH:", error.message);
    if (error.code === "23505") {
      return NextResponse.json({ error: "Eine Leistung mit diesem Titel existiert bereits." }, { status: 400 });
    }
    return NextResponse.json({ error: "Update fehlgeschlagen." }, { status: 500 });
  }
  const ctx = await getAdminContext();
  await writeAuditLogFromRequest(ctx, request, {
    action: detectServiceAuditAction(before, parsed.data),
    area: "cms_services",
    entityId: id,
    before: before ? { title: before.title, visible: before.visible } : undefined,
    after: parsed.data,
  });
  revalidatePublicCms();
  return NextResponse.json({ success: true, ...OK });
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin("website:write");
  if (authError) return authError;

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID erforderlich." }, { status: 400 });

  const before = await getCmsServiceById(id);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("cms_services").delete().eq("id", id);

  if (error) return NextResponse.json({ error: "Löschen fehlgeschlagen." }, { status: 500 });
  const ctx = await getAdminContext();
  await writeAuditLogFromRequest(ctx, request, {
    action: "service_delete",
    area: "cms_services",
    entityId: id,
    before: before ? { title: before.title } : undefined,
  });
  revalidatePublicCms();
  return NextResponse.json({ success: true, ...OK });
}
