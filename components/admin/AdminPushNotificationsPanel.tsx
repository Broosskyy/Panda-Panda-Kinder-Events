"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import {
  detectPushPlatform,
  subscribeToAdminPush,
  subscriptionToStored,
  unsubscribeFromAdminPush,
} from "@/lib/admin/push/client";
import type { PushPermissionState, PushStatusResponse, PushUiStatus } from "@/lib/admin/push/types";

function resolveClientStatus(
  platformSupported: boolean,
  configured: boolean,
  permission: PushPermissionState,
  subscribed: boolean,
): PushUiStatus {
  if (!platformSupported) return "unsupported";
  if (!configured) return "not_configured";
  if (permission === "denied") return "blocked";
  if (subscribed && permission === "granted") return "activated";
  if (permission === "granted") return "granted";
  return "not_asked";
}

function statusLabel(status: PushUiStatus): string {
  switch (status) {
    case "unsupported":
      return "Nicht unterstützt";
    case "not_configured":
      return "Nicht konfiguriert";
    case "not_asked":
      return "Noch nicht erlaubt";
    case "blocked":
      return "Blockiert";
    case "granted":
      return "Erlaubt";
    case "activated":
      return "Aktiviert";
    default:
      return status;
  }
}

export function AdminPushNotificationsPanel({ compact = false }: { compact?: boolean }) {
  const { toast } = useAdminMessages();
  const { permissions, identity } = useAdminSession();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [serverStatus, setServerStatus] = useState<PushStatusResponse | null>(null);
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const platform = useMemo(() => detectPushPlatform(), []);

  const canActivate = useMemo(
    () => permissions.includes("inquiries:write") || permissions.some((p) => p.startsWith("inquiries:")),
    [permissions],
  );

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      if (typeof Notification !== "undefined") {
        setPermission(Notification.permission as PushPermissionState);
      }
      const res = await fetch("/api/admin/push");
      if (res.ok) {
        setServerStatus((await res.json()) as PushStatusResponse);
      }
    } catch {
      // Non-fatal — UI shows fallback state.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const configured = serverStatus?.configured ?? false;
  const subscribed = serverStatus?.subscribed ?? false;
  const status = resolveClientStatus(platform.canSubscribe, configured, permission, subscribed);
  const roleSlug = identity?.roleSlug ?? "readonly";
  const canTest =
    Boolean(serverStatus?.canTest) &&
    (roleSlug === "administrator" || roleSlug === "manager") &&
    status === "activated";
  const canDeactivate = Boolean(serverStatus?.canDeactivate) && status === "activated";
  const isSuperAdmin = roleSlug === "administrator";

  const handleActivate = async () => {
    if (!canActivate) {
      toast("Du hast keine Berechtigung für Push-Benachrichtigungen.", "error");
      return;
    }
    if (!platform.canSubscribe) {
      toast(platform.detail, "error");
      return;
    }
    if (!configured) {
      toast("Push ist serverseitig nicht konfiguriert. VAPID Keys in Vercel setzen — siehe PUSH_SETUP.md.", "error");
      return;
    }

    setBusy(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PushPermissionState);

      if (result === "denied") {
        toast(
          "Benachrichtigungen sind im Browser blockiert. Bitte in den Website-Einstellungen erlauben.",
          "error",
        );
        return;
      }
      if (result !== "granted") return;

      const subscription = await subscribeToAdminPush();
      if (!subscription) {
        toast("Push-Subscription konnte nicht erstellt werden. Service Worker prüfen.", "error");
        return;
      }

      const res = await fetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscriptionToStored(subscription)),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Subscription konnte nicht gespeichert werden.", "error");
        return;
      }

      toast("Push-Benachrichtigungen aktiviert.");
      await loadStatus();
    } catch {
      toast("Push-Aktivierung fehlgeschlagen.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeactivate = async () => {
    setBusy(true);
    try {
      const endpoint = await unsubscribeFromAdminPush();
      const res = await fetch("/api/admin/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endpoint ? { endpoint } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Push konnte nicht deaktiviert werden.", "error");
        return;
      }
      toast("Push-Benachrichtigungen deaktiviert.");
      await loadStatus();
    } catch {
      toast("Push-Deaktivierung fehlgeschlagen.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/push/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Test fehlgeschlagen.", "error");
        return;
      }
      toast("Test-Benachrichtigung gesendet.");
    } catch {
      toast("Test-Benachrichtigung fehlgeschlagen.", "error");
    } finally {
      setBusy(false);
    }
  };

  if (!canActivate) {
    return (
      <p className="text-sm text-text-muted">
        Push-Benachrichtigungen sind für deine Rolle nicht verfügbar.
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex items-start gap-3">
        <div className="admin-pwa-install-card-icon" aria-hidden>
          {status === "activated" ? (
            <BellRing className="h-5 w-5 text-primary" />
          ) : status === "blocked" ? (
            <BellOff className="h-5 w-5 text-text-muted" />
          ) : (
            <Bell className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-semibold text-text-primary">Push-Benachrichtigungen</h3>
          <p className="mt-1 text-sm text-text-muted">
            Benachrichtigung bei neuer Anfrage — für Super Admin und Admin.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-bg-secondary p-3 text-sm space-y-2">
        <p className="font-medium text-text-primary">Status: {loading ? "…" : statusLabel(status)}</p>
        <p className="text-text-muted">
          Plattform: <span className="font-medium text-text-primary">{platform.label}</span>
        </p>
        <p className="text-xs text-text-secondary">{platform.detail}</p>

        {status === "unsupported" || platform.support === "ios_pwa_required" ? (
          <p className="text-amber-800">{platform.detail}</p>
        ) : null}
        {status === "not_configured" ? (
          <div className="space-y-1">
            <p className="text-amber-800">
              Push ist serverseitig nicht konfiguriert (VAPID Keys fehlen).
            </p>
            {isSuperAdmin ? (
              <p className="text-xs text-text-secondary">
                Keys generieren: <code className="text-text-primary">node scripts/generate-vapid-keys.mjs</code> —
                Anleitung in PUSH_SETUP.md, dann in Vercel ENV setzen und redeployen.
              </p>
            ) : (
              <p className="text-xs text-text-secondary">Bitte Super Admin kontaktieren (VAPID Setup).</p>
            )}
          </div>
        ) : null}
        {status === "blocked" ? (
          <p className="text-amber-800">
            Benachrichtigungen sind im Browser blockiert. Bitte in den Website-Einstellungen erlauben.
          </p>
        ) : null}
        {status === "activated" ? (
          <p className="text-[#2d5a3a]">Push-Benachrichtigungen sind auf diesem Gerät aktiv.</p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {status !== "activated" && status !== "unsupported" && status !== "not_configured" ? (
          <AdminButton variant="primary" onClick={() => void handleActivate()} disabled={busy || loading}>
            Benachrichtigungen aktivieren
          </AdminButton>
        ) : null}
        {canTest ? (
          <AdminButton variant="secondary" onClick={() => void handleTest()} disabled={busy || loading}>
            Test-Benachrichtigung senden
          </AdminButton>
        ) : null}
        {canDeactivate ? (
          <AdminButton variant="ghost" onClick={() => void handleDeactivate()} disabled={busy || loading}>
            Push deaktivieren
          </AdminButton>
        ) : null}
      </div>
    </div>
  );
}
