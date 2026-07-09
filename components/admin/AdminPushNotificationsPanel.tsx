"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Bug } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { beginPermissionRequest, beginPushSubscriptionInClick, runPushActivateFlow } from "@/lib/admin/push/activate-flow";
import { detectPushPlatform } from "@/lib/admin/push/client";
import { collectPushLiveDebugState, type PushLiveDebugState } from "@/lib/admin/push/debug-state";
import { unsubscribeFromAdminPush } from "@/lib/admin/push/client";
import type { PushPermissionState, PushStatusResponse, PushTestResponse, PushUiStatus } from "@/lib/admin/push/types";

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
  if (permission === "granted" && !subscribed) return "granted_not_registered";
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
      return "Im Browser blockiert";
    case "granted":
      return "Erlaubt";
    case "granted_not_registered":
      return "Berechtigung erlaubt, aber Gerät noch nicht registriert";
    case "activated":
      return "Aktiviert";
    default:
      return status;
  }
}

function primaryButtonLabel(status: PushUiStatus): string {
  if (status === "granted_not_registered") return "Gerät registrieren";
  return "Benachrichtigungen aktivieren";
}

function debugBool(value: boolean): string {
  return value ? "ja" : "nein";
}

function DebugRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-mono text-text-primary break-all">{value}</span>
    </div>
  );
}

export function AdminPushNotificationsPanel({ compact = false }: { compact?: boolean }) {
  const { toast } = useAdminMessages();
  const { permissions, identity } = useAdminSession();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [serverStatus, setServerStatus] = useState<PushStatusResponse | null>(null);
  const [permission, setPermission] = useState<PushPermissionState>("default");
  const [platform, setPlatform] = useState(() => detectPushPlatform());
  const [debugOpen, setDebugOpen] = useState(false);
  const [debugState, setDebugState] = useState<PushLiveDebugState | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastServerResponse, setLastServerResponse] = useState<string | null>(null);
  const [lastSteps, setLastSteps] = useState<string[]>([]);

  const canActivate = permissions.includes("inquiries:write") || permissions.some((p) => p.startsWith("inquiries:"));

  const refreshDebugState = useCallback(
    async (error?: string | null) => {
      try {
        const state = await collectPushLiveDebugState({
          serverSubscribed: serverStatus?.subscribed,
          lastError: error ?? lastError,
          lastServerResponse,
        });
        setDebugState(state);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error("[push:fail] debug_state:", msg);
      }
    },
    [lastError, lastServerResponse, serverStatus?.subscribed],
  );

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      setPlatform(detectPushPlatform());
      if (typeof Notification !== "undefined") {
        setPermission(Notification.permission as PushPermissionState);
      }
      const res = await fetch("/api/admin/push");
      if (res.ok) {
        setServerStatus((await res.json()) as PushStatusResponse);
      } else {
        const data = (await res.json()) as { error?: string };
        console.error("[push:fail] load_status:", data.error ?? res.status);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[push:fail] load_status:", msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    void refreshDebugState();
  }, [refreshDebugState, serverStatus?.subscribed, permission]);

  useEffect(() => {
    if (!debugOpen) return;
    const id = window.setInterval(() => {
      void refreshDebugState();
    }, 3000);
    return () => window.clearInterval(id);
  }, [debugOpen, refreshDebugState]);

  const configured = serverStatus?.configured ?? false;
  const subscribed = serverStatus?.subscribed ?? false;
  const status = resolveClientStatus(platform.canSubscribe, configured, permission, subscribed);
  const roleSlug = identity?.roleSlug ?? serverStatus?.diagnostics?.roleSlug ?? "readonly";
  const canTest = Boolean(serverStatus?.canTest) && status === "activated";
  const canDeactivate = Boolean(serverStatus?.canDeactivate) && status === "activated";
  const isSuperAdmin = roleSlug === "administrator";
  const showPrimaryButton = status !== "activated" && status !== "blocked";
  const primaryLabel = primaryButtonLabel(status);

  useEffect(() => {
    if (status === "granted_not_registered") {
      setDebugOpen(true);
    }
  }, [status]);

  const runActivation = () => {
    if (!canActivate) {
      const msg = "Du hast keine Berechtigung für Push-Benachrichtigungen.";
      console.error("[push:fail] precheck:", msg);
      toast(msg, "error");
      return;
    }

    setPlatform(detectPushPlatform());
    setDebugOpen(true);

    const isRegisterOnly = status === "granted_not_registered";
    const permissionPromise = beginPermissionRequest();
    const subscriptionPromise = isRegisterOnly ? beginPushSubscriptionInClick() : undefined;

    setBusy(true);
    setLastError(null);
    setLastServerResponse(null);
    setLastSteps([]);

    void (async () => {
      try {
        const result = await runPushActivateFlow({
          permissionResult: permissionPromise,
          configured,
          subscriptionPromise,
        });

        setLastSteps(result.steps.map((s) => `${s.ok ? "OK" : "FAIL"} ${s.step}: ${s.detail}`));
        setLastServerResponse(result.serverResponse);

        if (result.permission !== "unavailable") {
          setPermission(result.permission as PushPermissionState);
        }

        if (!result.ok) {
          const err = result.error ?? "Push-Aktivierung fehlgeschlagen (unbekannter Fehler).";
          setLastError(err);
          console.error("[push:fail] activate:", err);
          toast(err, "error");
          return;
        }

        toast(isRegisterOnly ? "Gerät erfolgreich registriert." : "Push-Benachrichtigungen aktiviert.");
        await loadStatus();
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        setLastError(msg);
        console.error("[push:fail] activate_unhandled:", msg);
        toast(`Gerät registrieren fehlgeschlagen: ${msg}`, "error");
      } finally {
        setBusy(false);
        void refreshDebugState();
      }
    })();
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
        const msg = data.error ?? "Push konnte nicht deaktiviert werden.";
        console.error("[push:fail] deactivate:", msg);
        toast(msg, "error");
        return;
      }
      toast("Push-Benachrichtigungen deaktiviert.");
      await loadStatus();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[push:fail] deactivate:", msg);
      toast(`Push-Deaktivierung fehlgeschlagen: ${msg}`, "error");
    } finally {
      setBusy(false);
      void refreshDebugState();
    }
  };

  const handleTest = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/push/test", { method: "POST" });
      const data = (await res.json()) as PushTestResponse;
      if (!res.ok) {
        const msg = data.error ?? `Test fehlgeschlagen (HTTP ${res.status}).`;
        console.error("[push:fail] test:", msg, data.errors);
        toast(msg, "error");
        if (data.errors?.length) {
          setLastError(data.errors.map((e) => `${e.message}${e.statusCode ? ` [${e.statusCode}]` : ""}`).join(" | "));
        }
        return;
      }
      if (data.warning) {
        toast(data.warning, "error");
      } else {
        toast("Test-Benachrichtigung gesendet.");
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[push:fail] test:", msg);
      toast(`Test-Benachrichtigung fehlgeschlagen: ${msg}`, "error");
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
            Benachrichtigungen sind im Browser blockiert. Bitte in den Website-Einstellungen für diese App erlauben.
          </p>
        ) : null}
        {status === "granted_not_registered" ? (
          <p className="text-amber-800">
            Berechtigung ist erteilt, aber dieses Gerät ist noch nicht beim Server registriert. Bitte auf „Gerät
            registrieren“ tippen.
          </p>
        ) : null}
        {status === "activated" ? (
          <p className="text-[#2d5a3a]">Push-Benachrichtigungen sind auf diesem Gerät aktiv.</p>
        ) : null}
        {!serverStatus?.diagnostics?.receivesInquiryPush && subscribed ? (
          <p className="text-amber-800 text-xs">
            Hinweis: Deine Rolle ({roleSlug}) erhält keine Anfrage-Pushes. Nur Super Admin und Admin werden
            benachrichtigt.
          </p>
        ) : null}
        {lastError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-xs text-red-800">
            Letzter Fehler: {lastError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {showPrimaryButton ? (
          <AdminButton variant="primary" onClick={runActivation} disabled={loading} loading={busy}>
            {busy
              ? status === "granted_not_registered"
                ? "Registriere Gerät…"
                : "Aktiviere…"
              : primaryLabel}
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
        <AdminButton
          variant="ghost"
          onClick={() => {
            setDebugOpen((open) => !open);
            void refreshDebugState();
          }}
          disabled={busy}
        >
          <Bug className="mr-1.5 inline h-4 w-4" aria-hidden />
          {debugOpen ? "Debug ausblenden" : "Push Diagnose"}
        </AdminButton>
      </div>

      {debugOpen ? (
        <div className="rounded-xl border border-dashed border-border bg-bg-secondary p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-text-primary">Push Diagnose (live)</p>
            <AdminButton variant="ghost" onClick={() => void refreshDebugState()} disabled={busy}>
              Aktualisieren
            </AdminButton>
          </div>
          {debugState ? (
            <div className="space-y-1">
              <DebugRow label="Permission" value={debugState.notificationPermission} />
              <DebugRow label="Subscription im Browser" value={debugBool(debugState.browserSubscriptionPresent)} />
              <DebugRow label="Subscription gespeichert" value={debugBool(debugState.serverSubscriptionSaved)} />
              <DebugRow label="Serverantwort" value={debugState.lastServerResponse ?? "—"} />
              <DebugRow label="Letzter Fehler" value={debugState.lastError ?? "—"} />
              <DebugRow label="Aktive Subscriptions (User)" value={String(debugState.userActiveSubscriptionCount)} />
              <DebugRow
                label="Aktive Admin-Subscriptions gesamt"
                value={String(debugState.totalAdminSubscriptionCount)}
              />
              <DebugRow label="Erhält Anfrage-Push" value={debugBool(debugState.receivesInquiryPush)} />
              <DebugRow label="Rolle" value={debugState.roleSlug} />
              <DebugRow label="Service Worker registriert" value={debugBool(debugState.serviceWorkerRegistered)} />
              <DebugRow label="Service Worker ready" value={debugBool(debugState.serviceWorkerReady)} />
              <DebugRow label="PushManager (Registration)" value={debugBool(debugState.pushManagerOnRegistration)} />
              <DebugRow label="VAPID Public Key" value={debugBool(debugState.vapidPublicKeyPresent)} />
              <DebugRow label="Plattform" value={debugState.platformLabel} />
              <DebugRow label="Standalone" value={debugBool(debugState.displayStandalone)} />
              <DebugRow label="Browser" value={debugState.browserUserAgent.slice(0, 80)} />
              <DebugRow label="Geprüft um" value={debugState.checkedAt} />
            </div>
          ) : (
            <p className="text-xs text-text-muted">Diagnose wird geladen …</p>
          )}
          {lastSteps.length > 0 ? (
            <div className="mt-2 border-t border-border pt-2">
              <p className="text-xs font-medium text-text-primary mb-1">Letzter Aktivierungsversuch</p>
              <ul className="space-y-0.5 text-xs font-mono text-text-secondary">
                {lastSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
