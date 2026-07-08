import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AdminContext, AuditLogFilters, AuditLogInput } from "@/lib/auth/types";
import { getRequestClientContext } from "@/lib/auth/request-context";

function sanitizeAuditPayload(value: unknown): unknown {
  if (value == null) return value;
  if (typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(sanitizeAuditPayload);

  const blocked = new Set([
    "password",
    "passwordHash",
    "password_hash",
    "totpSecret",
    "totp_secret",
    "token",
    "pendingToken",
    "backupCode",
    "adminPassword",
    "secret",
  ]);

  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (blocked.has(key)) continue;
    out[key] = sanitizeAuditPayload(val);
  }
  return out;
}

async function insertAuditLog(ctx: AdminContext | null, input: AuditLogInput): Promise<void> {
  const supabase = getSupabaseAdmin();
  await supabase.from("admin_audit_logs").insert({
    user_id: ctx?.userId ?? null,
    user_display_name: ctx?.displayName ?? "System",
    role_slug: ctx?.roleSlug ?? null,
    action: input.action,
    area: input.area,
    entity_id: input.entityId ?? null,
    before_json: sanitizeAuditPayload(input.before) ?? null,
    after_json: sanitizeAuditPayload(input.after) ?? null,
    success: input.success ?? true,
    error_message: input.errorMessage ?? null,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    device_label: input.deviceLabel ?? null,
    os_label: input.osLabel ?? null,
    browser_label: input.browserLabel ?? null,
    country_code: input.countryCode ?? null,
    region: input.region ?? null,
    city: input.city ?? null,
  });
}

async function insertWithRetry(ctx: AdminContext | null, input: AuditLogInput): Promise<void> {
  try {
    await insertAuditLog(ctx, input);
  } catch (first) {
    console.error("[audit] write failed, retrying once:", first);
    await new Promise((r) => setTimeout(r, 250));
    await insertAuditLog(ctx, input);
  }
}

/** Non-blocking audit write with single retry. */
export function queueAuditLog(ctx: AdminContext | null, input: AuditLogInput): void {
  void insertWithRetry(ctx, input).catch((err) => {
    console.error("[audit] permanent failure:", err);
  });
}

export async function writeAuditLog(ctx: AdminContext | null, input: AuditLogInput): Promise<void> {
  queueAuditLog(ctx, input);
}

export function queueAuditLogFromRequest(
  ctx: AdminContext | null,
  request: Request,
  input: Omit<AuditLogInput, "ipAddress" | "userAgent" | "deviceLabel" | "osLabel" | "browserLabel" | "countryCode" | "region" | "city">,
): void {
  const client = getRequestClientContext(request);
  queueAuditLog(ctx, {
    ...input,
    ipAddress: client.ipMasked,
    userAgent: client.userAgent,
    deviceLabel: client.deviceLabel,
    osLabel: client.osLabel,
    browserLabel: client.browserLabel,
    countryCode: client.countryCode,
    region: client.region,
    city: client.city,
  });
}

export async function writeAuditLogFromRequest(
  ctx: AdminContext | null,
  request: Request,
  input: Omit<AuditLogInput, "ipAddress" | "userAgent" | "deviceLabel" | "osLabel" | "browserLabel" | "countryCode" | "region" | "city">,
): Promise<void> {
  queueAuditLogFromRequest(ctx, request, input);
}

export async function listAuditLogs(filters: AuditLogFilters = {}) {
  const supabase = getSupabaseAdmin();
  const limit = Math.min(Math.max(filters.limit ?? 100, 1), 1000);

  let query = supabase
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.area) query = query.eq("area", filters.area);
  if (filters.action) query = query.ilike("action", `%${filters.action}%`);
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);
  if (filters.search?.trim()) {
    const term = filters.search.trim();
    query = query.or(
      `user_display_name.ilike.%${term}%,action.ilike.%${term}%,area.ilike.%${term}%,entity_id.ilike.%${term}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export function auditLogsToCsv(logs: Array<Record<string, unknown>>): string {
  const headers = [
    "created_at",
    "user_display_name",
    "role_slug",
    "action",
    "area",
    "entity_id",
    "success",
    "ip_address",
    "country_code",
    "region",
    "city",
    "browser_label",
    "os_label",
    "device_label",
    "user_agent",
    "error_message",
  ];
  const rows = logs.map((log) =>
    headers
      .map((h) => {
        const val = log[h];
        const str = val == null ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
