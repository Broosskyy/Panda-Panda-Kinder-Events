import { NextResponse } from "next/server";
import { requireAdmin, getAdminContext } from "@/lib/admin-route";
import { listLoginHistory } from "@/lib/auth/login-history";
import { listUserSessions } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/users";
import { fetchSecurityDashboardStats } from "@/lib/admin/dashboard-stats";

export async function GET(request: Request) {
  const authError = await requireAdmin("security:read");
  if (authError) return authError;

  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ error: "Nicht autorisiert." }, { status: 401 });

  const url = new URL(request.url);
  const filters = {
    userId: url.searchParams.get("userId") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    ipMasked: url.searchParams.get("ip") ?? undefined,
    device: url.searchParams.get("device") ?? undefined,
    success:
      url.searchParams.get("success") === "true"
        ? true
        : url.searchParams.get("success") === "false"
          ? false
          : undefined,
    limit: Number(url.searchParams.get("limit") ?? "100"),
  };

  try {
    const [history, sessions, security, user] = await Promise.all([
      listLoginHistory(filters),
      listUserSessions(ctx.userId),
      fetchSecurityDashboardStats(),
      getUserById(ctx.userId),
    ]);

    const failedRecent = history.filter((h) => !h.success).length;
    const warnings: Array<{ id: string; tone: "warning" | "danger" | "info"; label: string; href?: string }> = [];

    if (!user?.totp_enabled) {
      warnings.push({ id: "2fa-off", tone: "warning", label: "2FA nicht aktiviert", href: "/admin/sicherheit/2fa" });
    }
    if (failedRecent > 0) {
      warnings.push({
        id: "failed-logins",
        tone: "danger",
        label: `${failedRecent} fehlgeschlagene Anmeldungen im Zeitraum`,
        href: "/admin/sicherheit/login-historie?success=false",
      });
    }
    if (sessions.length > 3) {
      warnings.push({
        id: "many-sessions",
        tone: "info",
        label: `${sessions.length} aktive Geräte`,
        href: "/admin/sicherheit/sitzungen",
      });
    }
    if (security.systemStatus !== "ok") {
      warnings.push({
        id: "system",
        tone: security.systemStatus === "error" ? "danger" : "warning",
        label: security.systemStatusLabel,
        href: "/admin/einstellungen?tab=system",
      });
    }

    return NextResponse.json({
      history,
      sessions: sessions.map((s) => ({
        id: s.id,
        deviceLabel: s.device_label,
        lastActiveAt: s.last_active_at,
        isCurrent: s.id === ctx.sessionId,
      })),
      totpEnabled: Boolean(user?.totp_enabled),
      passwordLastChanged: user?.updated_at ?? null,
      warnings,
      security,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Laden fehlgeschlagen.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
