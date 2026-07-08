import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { services as staticServices } from "@/lib/services";
import type { CmsService } from "@/lib/cms/types";

export function mapStaticServiceToRow(service: (typeof staticServices)[number], sortOrder: number) {
  return {
    icon_key: service.iconKey,
    title: service.title,
    description: service.description,
    detail_text: service.detailText ?? service.description,
    image_url: service.imageUrl ?? "",
    button_label: service.buttonLabel ?? "Mehr erfahren",
    button_link: service.buttonLink ?? "",
    category: service.category ?? "",
    price_from: service.priceFrom ?? "",
    highlights: service.highlights ?? [],
    sort_order: sortOrder,
    visible: true,
  };
}

/** One-time seed: imports static website services when cms_services is empty. */
export async function ensureCmsServicesSeeded(): Promise<{ seeded: boolean; count: number }> {
  const supabase = getSupabaseAdmin();
  const { count, error: countError } = await supabase
    .from("cms_services")
    .select("id", { count: "exact", head: true });

  if (countError) throw new Error(countError.message);
  if ((count ?? 0) > 0) return { seeded: false, count: count ?? 0 };

  const rows = staticServices.map((service, index) => mapStaticServiceToRow(service, index));
  const { error } = await supabase.from("cms_services").insert(rows);
  if (error) throw new Error(error.message);

  return { seeded: true, count: rows.length };
}

export async function listCmsServicesAdmin(): Promise<CmsService[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("cms_services")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CmsService[];
}

export async function getCmsServiceById(id: string): Promise<CmsService | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("cms_services").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as CmsService | null) ?? null;
}

export async function swapServiceSortOrder(id: string, direction: "up" | "down"): Promise<void> {
  const services = await listCmsServicesAdmin();
  const index = services.findIndex((s) => s.id === id);
  if (index < 0) throw new Error("Leistung nicht gefunden.");

  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= services.length) return;

  const current = services[index]!;
  const other = services[swapIndex]!;
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { error: e1 } = await supabase
    .from("cms_services")
    .update({ sort_order: other.sort_order, updated_at: now })
    .eq("id", current.id);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from("cms_services")
    .update({ sort_order: current.sort_order, updated_at: now })
    .eq("id", other.id);
  if (e2) throw new Error(e2.message);
}
