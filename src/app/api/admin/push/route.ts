import { NextResponse } from "next/server";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import { adminHasPermission } from "@/lib/auth/context";
import { getVapidPublicKey, isPushConfigured } from "@/lib/admin/push/config";
import { getActiveSubscriptionForUser } from "@/lib/admin/push/subscriptions";
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

  if (configured) {
    try {
      const row = await getActiveSubscriptionForUser(ctx.userId);
      subscribed = Boolean(row);
    } catch {
      subscribed = false;
    }
  }

  let status: PushUiStatus = "not_asked";
  if (!configured) status = "not_configured";
  else if (subscribed) status = "activated";

  const canTest =
    adminHasPermission(ctx, PUSH_PERMISSION) &&
    (ctx.roleSlug === "administrator" || ctx.roleSlug === "manager");

  return NextResponse.json({
    configured,
    publicKey,
    status,
    subscribed,
    canActivate: adminHasPermission(ctx, PUSH_PERMISSION),
    canTest,
    permission: PUSH_PERMISSION,
  });
}
