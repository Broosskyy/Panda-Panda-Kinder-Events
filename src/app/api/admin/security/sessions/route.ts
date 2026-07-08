import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import {
  listUserSessions,
  revokeOtherSessions,
  revokeAllSessions,
  revokeSession,
} from "@/lib/auth/session";
import { writeAuditLog } from "@/lib/auth/audit";

export async function GET() {
  const authError = await requireAdmin("security:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  try {
    const sessions = await listUserSessions(ctx.userId);
    return NextResponse.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        deviceLabel: s.device_label,
        userAgent: s.user_agent,
        lastActiveAt: s.last_active_at,
        createdAt: s.created_at,
        expiresAt: s.expires_at,
        isCurrent: s.id === ctx.sessionId,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authError = await requireAdmin("security:write");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) {
    return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });
  }

  const { action, sessionId } = await request.json();

  try {
    if (action === "revoke_others" && ctx.sessionId) {
      await revokeOtherSessions(ctx.userId, ctx.sessionId);
      await writeAuditLog(ctx, { action: "revoke_other_sessions", area: "security" });
    } else if (action === "revoke_all") {
      await revokeAllSessions(ctx.userId);
      await writeAuditLog(ctx, { action: "revoke_all_sessions", area: "security" });
    } else if (action === "revoke_one" && sessionId) {
      await revokeSession(sessionId, ctx.userId);
      await writeAuditLog(ctx, { action: "revoke_session", area: "security", entityId: sessionId });
    } else {
      return NextResponse.json({ error: "Ungültige Aktion." }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Aktion fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
