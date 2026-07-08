import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hashIp } from "@/lib/auth/crypto";
import { parseUserAgent } from "@/lib/auth/ua";
import { getRequestClientContext } from "@/lib/auth/request-context";
import type { LoginHistoryFilters } from "@/lib/auth/types";

export interface LoginHistoryRow {
  id: string;
  user_id: string | null;
  identifier_attempt: string | null;
  success: boolean;
  device_label: string | null;
  os_label: string | null;
  browser_label: string | null;
  role_slug: string | null;
  ip_masked: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  created_at: string;
  user_display_name?: string | null;
  role_label?: string | null;
}

export async function recordLoginHistory(input: {
  userId?: string;
  identifier: string;
  success: boolean;
  ip: string;
  userAgent: string | null;
  roleSlug?: string | null;
  request?: Request;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const ua = parseUserAgent(input.userAgent);
  const client = input.request ? getRequestClientContext(input.request) : null;

  const { error } = await supabase.from("admin_login_history").insert({
    user_id: input.userId ?? null,
    identifier_attempt: input.identifier,
    success: input.success,
    ip_hash: hashIp(input.ip),
    ip_masked: client?.ipMasked ?? null,
    user_agent: input.userAgent,
    device_label: ua.device,
    os_label: ua.os,
    browser_label: ua.browser,
    role_slug: input.roleSlug ?? null,
    country_code: client?.countryCode ?? null,
    region: client?.region ?? null,
    city: client?.city ?? null,
  });

  if (error) {
    console.error("[login-history] insert failed:", error.message);
  }
}

export async function listLoginHistory(filters: LoginHistoryFilters = {}): Promise<LoginHistoryRow[]> {
  const supabase = getSupabaseAdmin();
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);

  let query = supabase
    .from("admin_login_history")
    .select(
      "id, user_id, identifier_attempt, success, device_label, os_label, browser_label, role_slug, ip_masked, country_code, region, city, created_at, admin_users(display_name, admin_roles(label))",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);
  if (filters.ipMasked) query = query.ilike("ip_masked", `%${filters.ipMasked}%`);
  if (filters.device) query = query.ilike("device_label", `%${filters.device}%`);
  if (filters.success !== undefined) query = query.eq("success", filters.success);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const users = row.admin_users as
      | { display_name?: string; admin_roles?: { label?: string } | { label?: string }[] }
      | { display_name?: string; admin_roles?: { label?: string } | { label?: string }[] }[]
      | null;
    const user = users && !Array.isArray(users) ? users : Array.isArray(users) ? users[0] : null;
    const roles = user?.admin_roles;
    const roleLabel = roles && !Array.isArray(roles) ? roles.label : Array.isArray(roles) ? roles[0]?.label : null;

    return {
      id: row.id,
      user_id: row.user_id,
      identifier_attempt: row.identifier_attempt,
      success: row.success,
      device_label: row.device_label,
      os_label: row.os_label,
      browser_label: row.browser_label,
      role_slug: row.role_slug,
      ip_masked: row.ip_masked,
      country_code: row.country_code,
      region: row.region,
      city: row.city,
      created_at: row.created_at,
      user_display_name: user?.display_name ?? null,
      role_label: roleLabel ?? null,
    };
  });
}
