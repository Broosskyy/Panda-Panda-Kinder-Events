import webpush from "web-push";
import { safeApiError } from "@/lib/api-error";
import {
  ensureVapidConfigured,
  isPushConfigured,
  PUSH_INQUIRY_NOTIFICATION,
} from "@/lib/admin/push/config";
import { formatWebPushError, pushLog } from "@/lib/admin/push/log";
import {
  listInquiryPushRecipients,
  revokePushSubscription,
  touchPushSubscription,
} from "@/lib/admin/push/subscriptions";
import type {
  InquiryPushResult,
  PushNotificationPayload,
  PushSendDetailedResult,
  PushSendErrorDetail,
  PushSubscriptionRow,
} from "@/lib/admin/push/types";

function isExpiredSubscriptionError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const statusCode = "statusCode" in error ? Number((error as { statusCode?: number }).statusCode) : 0;
  return statusCode === 404 || statusCode === 410;
}

export async function sendPushToSubscription(
  row: Pick<PushSubscriptionRow, "id" | "endpoint" | "p256dh" | "auth">,
  payload: PushNotificationPayload,
): Promise<{ ok: true } | { ok: false; expired: boolean; error: PushSendErrorDetail }> {
  if (!ensureVapidConfigured()) {
    const error: PushSendErrorDetail = {
      subscriptionId: row.id,
      endpoint: row.endpoint,
      message: "VAPID nicht konfiguriert",
      expired: false,
    };
    return { ok: false, expired: false, error };
  }

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
    const formatted = formatWebPushError(error);
    const expired = isExpiredSubscriptionError(error);

    if (expired) {
      await revokePushSubscription(row.endpoint);
      pushLog("invalid_subscription_disabled", {
        subscriptionId: row.id,
        endpoint: row.endpoint.slice(0, 64),
        statusCode: formatted.statusCode,
        message: formatted.message,
      });
    } else {
      safeApiError("Web push send:", error, row.endpoint);
    }

    return {
      ok: false,
      expired,
      error: {
        subscriptionId: row.id,
        endpoint: row.endpoint,
        statusCode: formatted.statusCode,
        message: formatted.message,
        expired,
      },
    };
  }
}

export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload,
): Promise<PushSendDetailedResult> {
  if (!isPushConfigured()) {
    return {
      sent: 0,
      failed: 0,
      errors: [{ subscriptionId: "-", endpoint: "-", message: "Push nicht konfiguriert", expired: false }],
    };
  }

  const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("admin_push_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("enabled", true)
    .is("revoked_at", null);

  if (error) {
    safeApiError("Push subscriptions load:", error, userId);
    return {
      sent: 0,
      failed: 0,
      errors: [{ subscriptionId: "-", endpoint: "-", message: error.message, expired: false }],
    };
  }

  const rows = (data as PushSubscriptionRow[]) ?? [];
  if (rows.length === 0) {
    return {
      sent: 0,
      failed: 0,
      errors: [{ subscriptionId: "-", endpoint: "-", message: "Keine aktive Subscription in DB", expired: false }],
    };
  }

  let sent = 0;
  let failed = 0;
  const errors: PushSendErrorDetail[] = [];

  for (const row of rows) {
    const result = await sendPushToSubscription(row, payload);
    if (result.ok) {
      sent += 1;
    } else {
      failed += 1;
      errors.push(result.error);
    }
  }

  return { sent, failed, errors };
}

export async function notifyAdminsNewInquiry(): Promise<InquiryPushResult> {
  if (!isPushConfigured()) {
    const skippedReason = "Push nicht konfiguriert (VAPID Keys fehlen)";
    pushLog("inquiry_push_send_failed", { reason: skippedReason });
    return { recipientsCount: 0, sent: 0, failed: 0, errors: [], skippedReason };
  }

  pushLog("inquiry_push_send_started", {});

  try {
    const recipients = await listInquiryPushRecipients();
    pushLog("inquiry_push_recipients_count", { count: recipients.length });

    if (recipients.length === 0) {
      const skippedReason = "Keine aktiven Admin-Subscriptions (administrator/manager, enabled=true)";
      pushLog("inquiry_push_send_failed", { reason: skippedReason, recipientsCount: 0 });
      return { recipientsCount: 0, sent: 0, failed: 0, errors: [], skippedReason };
    }

    const payload: PushNotificationPayload = { ...PUSH_INQUIRY_NOTIFICATION };
    let sent = 0;
    let failed = 0;
    const errors: PushSendErrorDetail[] = [];

    for (const row of recipients) {
      const result = await sendPushToSubscription(row, payload);
      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
        errors.push(result.error);
        pushLog("inquiry_push_send_failed", {
          subscriptionId: row.id,
          userId: row.user_id,
          statusCode: result.error.statusCode,
          message: result.error.message,
          expired: result.error.expired,
        });
      }
    }

    if (sent > 0) {
      pushLog("inquiry_push_send_success", { recipientsCount: recipients.length, sent, failed });
    } else {
      pushLog("inquiry_push_send_failed", {
        recipientsCount: recipients.length,
        sent,
        failed,
        reason: "Alle Sends fehlgeschlagen",
        errors: errors.map((e) => ({ id: e.subscriptionId, statusCode: e.statusCode, message: e.message })),
      });
    }

    return { recipientsCount: recipients.length, sent, failed, errors };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    pushLog("inquiry_push_send_failed", { reason: message });
    safeApiError("notifyAdminsNewInquiry:", error, "");
    return {
      recipientsCount: 0,
      sent: 0,
      failed: 0,
      errors: [{ subscriptionId: "-", endpoint: "-", message, expired: false }],
      skippedReason: message,
    };
  }
}

export async function sendTestPushToUser(userId: string): Promise<PushSendDetailedResult> {
  pushLog("test_push_send_started", { userId });

  const result = await sendPushToUser(userId, {
    title: "Test-Benachrichtigung",
    body: "Push-Benachrichtigungen sind aktiv.",
    icon: PUSH_INQUIRY_NOTIFICATION.icon,
    tag: "pb-admin-push-test",
    data: { url: PUSH_INQUIRY_NOTIFICATION.data.url, type: "test" },
  });

  if (result.sent > 0) {
    pushLog("test_push_send_success", { userId, sent: result.sent, failed: result.failed });
  } else {
    pushLog("test_push_send_failed", {
      userId,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors.map((e) => ({ statusCode: e.statusCode, message: e.message })),
    });
  }

  return result;
}
