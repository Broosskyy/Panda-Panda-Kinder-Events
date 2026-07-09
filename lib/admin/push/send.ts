import webpush from "web-push";
import { safeApiError } from "@/lib/api-error";
import {
  ensureVapidConfigured,
  isPushConfigured,
  PUSH_INQUIRY_NOTIFICATION,
} from "@/lib/admin/push/config";
import {
  listInquiryPushRecipients,
  parseStoredSubscription,
  revokePushSubscription,
  touchPushSubscription,
} from "@/lib/admin/push/subscriptions";
import type { PushNotificationPayload } from "@/lib/admin/push/types";

function isExpiredSubscriptionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const statusCode = "statusCode" in error ? Number((error as { statusCode?: number }).statusCode) : 0;
  return statusCode === 404 || statusCode === 410;
}

export async function sendPushToSubscription(
  row: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushNotificationPayload,
): Promise<{ ok: true } | { ok: false; expired: boolean }> {
  if (!ensureVapidConfigured()) return { ok: false, expired: false };

  try {
    await webpush.sendNotification(
      {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      },
      JSON.stringify(payload),
    );
    await touchPushSubscription(row.id);
    return { ok: true };
  } catch (error) {
    if (isExpiredSubscriptionError(error)) {
      await revokePushSubscription(row.endpoint);
      return { ok: false, expired: true };
    }
    safeApiError("Web push send:", error, row.endpoint);
    return { ok: false, expired: false };
  }
}

export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload,
): Promise<{ sent: number; failed: number }> {
  if (!isPushConfigured()) return { sent: 0, failed: 0 };

  const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .is("revoked_at", null);
  if (error) {
    safeApiError("Push subscriptions load:", error, userId);
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  for (const row of data ?? []) {
    const result = await sendPushToSubscription(row, payload);
    if (result.ok) sent += 1;
    else failed += 1;
  }
  return { sent, failed };
}

export async function notifyAdminsNewInquiry(): Promise<void> {
  if (!isPushConfigured()) return;

  try {
    const recipients = await listInquiryPushRecipients();
    if (recipients.length === 0) return;

    const payload: PushNotificationPayload = { ...PUSH_INQUIRY_NOTIFICATION };
    await Promise.all(
      recipients.map(async (row) => {
        const result = await sendPushToSubscription(row, payload);
        if (!result.ok && !result.expired) {
          safeApiError("Inquiry push failed for subscription:", row.id, "");
        }
      }),
    );
  } catch (error) {
    safeApiError("notifyAdminsNewInquiry:", error, "");
  }
}

export async function sendTestPushToUser(userId: string): Promise<{ sent: number; failed: number }> {
  return sendPushToUser(userId, {
    title: "Test-Benachrichtigung",
    body: "Push-Benachrichtigungen sind aktiv.",
    icon: PUSH_INQUIRY_NOTIFICATION.icon,
    tag: "pb-admin-push-test",
    data: { url: PUSH_INQUIRY_NOTIFICATION.data.url, type: "test" },
  });
}

export { parseStoredSubscription };
