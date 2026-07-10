import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { DEFAULT_COMPANY_EMAIL } from "@/lib/email/constants";
import { extractDomainFromEmail } from "@/lib/system-config";
import { getEmailSettings } from "@/lib/email/sender";
import type { SiteEmailAliasRecord } from "@/lib/cms/types";

function mapRow(row: Record<string, unknown>): SiteEmailAliasRecord {
  return {
    id: String(row.id),
    aliasAddress: String(row.alias_address ?? ""),
    forwardTo: String(row.forward_to ?? ""),
    description: String(row.description ?? ""),
    isActive: Boolean(row.is_active),
    sortOrder: Number(row.sort_order ?? 0),
    tenantId: row.tenant_id != null ? String(row.tenant_id) : null,
  };
}

function extractDomain(email: string): string {
  return extractDomainFromEmail(email);
}

function buildDefaultAliases(domain: string, companyEmail: string): SiteEmailAliasRecord[] {
  const targets = [
    { local: "info", desc: "Allgemeine Anfragen" },
    { local: "buchung", desc: "Buchungsanfragen" },
    { local: "bewertung", desc: "Bewertungen" },
    { local: "rechnung", desc: "Rechnungen" },
    { local: "angebote", desc: "Angebote" },
  ];
  return targets.map((item, i) => ({
    id: `default-${item.local}`,
    aliasAddress: `${item.local}@${domain}`,
    forwardTo: companyEmail,
    description: item.desc,
    isActive: true,
    sortOrder: i,
  }));
}

export async function listEmailAliases(tenantId?: string | null): Promise<SiteEmailAliasRecord[]> {
  const settings = await getEmailSettings();
  const domain = extractDomain(settings.senderEmail || settings.companyEmail || DEFAULT_COMPANY_EMAIL);
  const companyEmail = settings.companyEmail || settings.replyTo || DEFAULT_COMPANY_EMAIL;
  const fallback = buildDefaultAliases(domain, companyEmail);

  if (!isSupabaseConfigured()) return fallback;

  const supabase = getSupabaseAdmin();
  let query = supabase.from("email_aliases").select("*").order("sort_order").order("alias_address");
  if (tenantId) query = query.eq("tenant_id", tenantId);
  else query = query.is("tenant_id", null);

  const { data, error } = await query;
  if (error || !data?.length) return fallback;
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function upsertEmailAlias(
  alias: Omit<SiteEmailAliasRecord, "id"> & { id?: string },
  tenantId?: string | null,
): Promise<SiteEmailAliasRecord> {
  if (!isSupabaseConfigured()) {
    throw new Error("Datenbank nicht konfiguriert — Aliase können nicht gespeichert werden.");
  }
  const supabase = getSupabaseAdmin();
  const payload = {
    alias_address: alias.aliasAddress.trim(),
    forward_to: alias.forwardTo.trim(),
    description: alias.description?.trim() ?? "",
    is_active: alias.isActive ?? true,
    sort_order: alias.sortOrder ?? 0,
    tenant_id: tenantId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (alias.id && !alias.id.startsWith("default-")) {
    const { data, error } = await supabase
      .from("email_aliases")
      .update(payload)
      .eq("id", alias.id)
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message ?? "Alias konnte nicht gespeichert werden.");
    return mapRow(data as Record<string, unknown>);
  }

  const { data, error } = await supabase.from("email_aliases").insert(payload).select("*").single();
  if (error || !data) throw new Error(error?.message ?? "Alias konnte nicht angelegt werden.");
  return mapRow(data as Record<string, unknown>);
}

export async function deleteEmailAlias(id: string): Promise<void> {
  if (!isSupabaseConfigured() || id.startsWith("default-")) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("email_aliases").delete().eq("id", id);
}

export function resolveAliasForward(
  address: string,
  aliases: SiteEmailAliasRecord[],
): string | null {
  const normalized = address.trim().toLowerCase();
  const match = aliases.find((a) => a.isActive && a.aliasAddress.trim().toLowerCase() === normalized);
  return match?.forwardTo?.trim() || null;
}
