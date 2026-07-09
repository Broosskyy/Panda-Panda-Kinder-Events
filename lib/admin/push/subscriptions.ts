import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { PushSubscriptionRow, StoredPushSubscription } from "@/lib/admin/push/types";

const INQUIRY_PUSH_ROLES = ["administrator", "manager"] as const;

export function parseStoredSubscription(row: PushSubscriptionRow): StoredPushSubscription {
  return {
    endpoint: row.endpoint,
    keys: { p256dh: row.p256dh, auth: row.auth },
  };
}

export async function upsertPushSubscription(input: {
  userId: string;
  subscription: StoredPushSubscription;
  userAgent?: string | null;
}): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase.from("admin_push_subscriptions").upsert(
    {
      user_id: input.userId,
      endpoint: input.subscription.endpoint,
      p256dh: input.subscription.keys.p256dh,
      auth: input.subscription.keys.auth,
      user_agent: input.userAgent ?? null,
      updated_at: now,
      revoked_at: null,
    },
    { onConflict: "endpoint" },
  );
  if (error) throw error;
}

export async function revokePushSubscription(endpoint: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("admin_push_subscriptions")
    .update({ revoked_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("endpoint", endpoint);
  if (error) throw error;
}

export async function revokePushSubscriptionsForUser(userId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("admin_push_subscriptions")
    .update({ revoked_at: now, updated_at: now })
    .eq("user_id", userId)
    .is("revoked_at", null);
  if (error) throw error;
}

export async function getActiveSubscriptionForUser(userId: string): Promise<PushSubscriptionRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as PushSubscriptionRow | null) ?? null;
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
    .is("revoked_at", null);
  if (error) throw error;
  return (data as PushSubscriptionRow[]) ?? [];
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
