import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PushSubscriptionRow, StoredPushSubscription } from "@/lib/admin/push/types";

const INQUIRY_PUSH_ROLES = ["administrator", "manager"] as const;

export function parseStoredSubscription(row: PushSubscriptionRow): StoredPushSubscription {
  return {
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  };
}

export function isInquiryPushRole(roleSlug: string): boolean {
  return (INQUIRY_PUSH_ROLES as readonly string[]).includes(roleSlug);
}

export async function upsertPushSubscription(input: {
  userId: string;
  subscription: StoredPushSubscription;
  userAgent?: string | null;
}): Promise<PushSubscriptionRow> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .upsert(
      {
        user_id: input.userId,
        endpoint: input.subscription.endpoint,
        p256dh: input.subscription.keys.p256dh,
        auth: input.subscription.keys.auth,
        user_agent: input.userAgent ?? null,
        enabled: true,
        updated_at: now,
        revoked_at: null,
      },
      { onConflict: "endpoint" },
    )
    .select("*")
    .single();

  if (error) throw error;
  if (!data?.endpoint || !data.p256dh || !data.auth) {
    throw new Error("Subscription unvollständig nach Speichern (endpoint/p256dh/auth fehlt).");
  }
  if (!data.enabled || data.revoked_at) {
    throw new Error("Subscription nach Speichern nicht aktiv (enabled/revoked_at).");
  }

  return data as PushSubscriptionRow;
}

export async function revokePushSubscription(endpoint: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("admin_push_subscriptions")
    .update({ enabled: false, revoked_at: now, updated_at: now })
    .eq("endpoint", endpoint);
  if (error) throw error;
}

export async function disablePushSubscriptionsForUser(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .update({ enabled: false, revoked_at: now, updated_at: now })
    .eq("user_id", userId)
    .eq("enabled", true)
    .is("revoked_at", null)
    .select("id");
  if (error) throw error;
  return data?.length ?? 0;
}

export async function getActiveSubscriptionForUser(userId: string): Promise<PushSubscriptionRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("enabled", true)
    .is("revoked_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as PushSubscriptionRow | null) ?? null;
}

export async function countActiveSubscriptionsForUser(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("admin_push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("enabled", true)
    .is("revoked_at", null);
  if (error) throw error;
  return count ?? 0;
}

export async function listInquiryPushRecipients(): Promise<PushSubscriptionRow[]> {
  const supabase = getSupabaseAdmin();
  const { data: roles, error: rolesError } = await supabase
    .from("admin_roles")
    .select("id")
    .in("slug", [...INQUIRY_PUSH_ROLES]);
  if (rolesError) throw rolesError;
  const roleIds = (roles ?? []).map((r) => r.id);
  if (roleIds.length === 0) return [];

  const { data: users, error: usersError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("active", true)
    .in("role_id", roleIds);
  if (usersError) throw usersError;
  const userIds = (users ?? []).map((u) => u.id);
  if (userIds.length === 0) return [];

  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .select("*")
    .in("user_id", userIds)
    .eq("enabled", true)
    .is("revoked_at", null);
  if (error) throw error;
  return (data as PushSubscriptionRow[]) ?? [];
}

export async function countInquiryPushRecipients(): Promise<number> {
  const recipients = await listInquiryPushRecipients();
  return recipients.length;
}

export async function touchPushSubscription(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("admin_push_subscriptions")
    .update({ last_used_at: now, updated_at: now })
    .eq("id", id);
  if (error) throw error;
}
