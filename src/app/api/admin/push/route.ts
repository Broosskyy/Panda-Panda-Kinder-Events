import { NextResponse } from "next/server";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import { adminHasPermission } from "@/lib/auth/context";
import { getVapidPublicKey, isPushConfigured } from "@/lib/admin/push/config";
import {
  countActiveSubscriptionsForUser,
  countInquiryPushRecipients,
  getActiveSubscriptionForUser,
  isInquiryPushRole,
} from "@/lib/admin/push/subscriptions";
import type { PushUiStatus } from "@/lib/admin/push/types";

const PUSH_PERMISSION = "inquiries:write";

export async function GET() {
  const authError = await requireAdmin(PUSH_PERMISSION);
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const configured = isPushConfigured();
  const publicKey = getVapidPublicKey();
  let subscribed = false;
  let activeRow = null;
  let userActiveSubscriptionCount = 0;
  let totalAdminSubscriptionCount = 0;

  if (configured) {
    try {
      activeRow = await getActiveSubscriptionForUser(ctx.userId);
      subscribed = Boolean(activeRow);
      userActiveSubscriptionCount = await countActiveSubscriptionsForUser(ctx.userId);
      totalAdminSubscriptionCount = await countInquiryPushRecipients();
    } catch {
      subscribed = false;
    }
  }

  let status: PushUiStatus = "not_asked";
  if (!configured) status = "not_configured";
  else if (subscribed) status = "activated";

  const isAdminRole = isInquiryPushRole(ctx.roleSlug);
  const canTest = adminHasPermission(ctx, PUSH_PERMISSION) && isAdminRole && subscribed;

  return NextResponse.json({
    configured,
    publicKey,
    status,
    subscribed,
    canActivate: adminHasPermission(ctx, PUSH_PERMISSION),
    canTest,
    canDeactivate: subscribed && adminHasPermission(ctx, PUSH_PERMISSION),
    permission: PUSH_PERMISSION,
    setupGuide: "/PUSH_SETUP.md",
    diagnostics: {
      userActiveSubscriptionCount,
      totalAdminSubscriptionCount,
      receivesInquiryPush: isAdminRole,
      roleSlug: ctx.roleSlug,
      dbSubscription: activeRow
        ? {
            id: activeRow.id,
            endpoint: activeRow.endpoint,
            enabled: activeRow.enabled,
            revokedAt: activeRow.revoked_at,
          }
        : null,
    },
  });
}
