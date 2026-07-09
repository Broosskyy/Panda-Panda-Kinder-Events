import { NextResponse } from "next/server";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import { isPushConfigured } from "@/lib/admin/push/config";
import { sendTestPushToUser } from "@/lib/admin/push/send";
import { safeApiError } from "@/lib/api-error";

const PUSH_PERMISSION = "inquiries:write";

export async function POST() {
  const authError = await requireAdmin(PUSH_PERMISSION);
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  if (ctx.roleSlug !== "administrator" && ctx.roleSlug !== "manager") {
    return NextResponse.json(
      { error: "Test-Benachrichtigungen sind nur für Admin und Super Admin verfügbar." },
      { status: 403 },
    );
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push ist nicht konfiguriert." }, { status: 503 });
  }

  try {
    const result = await sendTestPushToUser(ctx.userId);
    if (result.sent === 0) {
      return NextResponse.json(
        {
          error: "Keine aktive Subscription gefunden. Bitte zuerst Benachrichtigungen aktivieren.",
        },
        { status: 400 },
      );
    }
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    safeApiError("Push test:", error, "");
    return NextResponse.json({ error: "Test-Benachrichtigung konnte nicht gesendet werden." }, { status: 500 });
  }
}
