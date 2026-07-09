import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminContext, requireAdmin } from "@/lib/admin-route";
import { isPushConfigured } from "@/lib/admin/push/config";
import { upsertPushSubscription } from "@/lib/admin/push/subscriptions";
import { safeApiError } from "@/lib/api-error";

const PUSH_PERMISSION = "inquiries:write";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(request: Request) {
  const authError = await requireAdmin(PUSH_PERMISSION);
  if (authError) return authError;

  if (!isPushConfigured()) {
    return NextResponse.json({ error: "Push ist nicht konfiguriert." }, { status: 503 });
  }

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Subscription-Daten." }, { status: 400 });
    }

    await upsertPushSubscription({
      userId: ctx.userId,
      subscription: parsed.data,
      userAgent: request.headers.get("user-agent"),
    });

    return NextResponse.json({ success: true, subscribed: true });
  } catch (error) {
    safeApiError("Push subscribe:", error, "");
    return NextResponse.json({ error: "Subscription konnte nicht gespeichert werden." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const authError = await requireAdmin(PUSH_PERMISSION);
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : null;

    if (endpoint) {
      const { revokePushSubscription } = await import("@/lib/admin/push/subscriptions");
      await revokePushSubscription(endpoint);
    } else {
      const { revokePushSubscriptionsForUser } = await import("@/lib/admin/push/subscriptions");
      await revokePushSubscriptionsForUser(ctx.userId);
    }

    return NextResponse.json({ success: true, subscribed: false });
  } catch (error) {
    safeApiError("Push unsubscribe:", error, "");
    return NextResponse.json({ error: "Subscription konnte nicht entfernt werden." }, { status: 500 });
  }
}
