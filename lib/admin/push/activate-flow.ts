"use client";

import { getVapidPublicKeyClient } from "@/lib/admin/push/public-config";
import { detectPushPlatform } from "@/lib/admin/push/platform";
import { subscriptionToStored, urlBase64ToUint8Array } from "@/lib/admin/push/client";

export type PushActivateStep =
  | "precheck"
  | "request_permission"
  | "permission_result"
  | "service_worker_ready"
  | "push_manager"
  | "subscribe"
  | "save_server";

export interface PushActivateStepLog {
  step: PushActivateStep;
  ok: boolean;
  detail: string;
}

export interface PushActivateResult {
  ok: boolean;
  steps: PushActivateStepLog[];
  error: string | null;
  permission: NotificationPermission | "unavailable";
}

function logStep(steps: PushActivateStepLog[], step: PushActivateStep, ok: boolean, detail: string) {
  const entry = { step, ok, detail };
  steps.push(entry);
  const prefix = ok ? "[push:ok]" : "[push:fail]";
  console.error(`${prefix} ${step}: ${detail}`);
}

export async function runPushActivateFlow(opts: {
  permissionResult: NotificationPermission | Promise<NotificationPermission>;
  configured: boolean;
}): Promise<PushActivateResult> {
  const steps: PushActivateStepLog[] = [];
  const platform = detectPushPlatform();

  if (!opts.configured) {
    const msg = "VAPID Public Key fehlt im Build (NEXT_PUBLIC_VAPID_PUBLIC_KEY).";
    logStep(steps, "precheck", false, msg);
    return { ok: false, steps, error: msg, permission: "default" };
  }

  if (!platform.canSubscribe) {
    const msg = platform.detail;
    logStep(steps, "precheck", false, msg);
    return { ok: false, steps, error: msg, permission: "default" };
  }

  if (typeof Notification === "undefined") {
    const msg = "Notification API nicht verfügbar.";
    logStep(steps, "precheck", false, msg);
    return { ok: false, steps, error: msg, permission: "unavailable" };
  }

  logStep(steps, "precheck", true, `Plattform: ${platform.label}`);

  let permission: NotificationPermission;
  try {
    logStep(steps, "request_permission", true, "Notification.requestPermission() gestartet");
    permission = await opts.permissionResult;
    logStep(steps, "permission_result", permission === "granted", `Ergebnis: ${permission}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep(steps, "permission_result", false, msg);
    return { ok: false, steps, error: `Permission-Anfrage fehlgeschlagen: ${msg}`, permission: Notification.permission };
  }

  if (permission === "denied") {
    return {
      ok: false,
      steps,
      error: "Benachrichtigungen sind blockiert. Bitte in den iOS-Einstellungen für diese App erlauben.",
      permission,
    };
  }

  if (permission !== "granted") {
    return {
      ok: false,
      steps,
      error: `Permission nicht erteilt (Status: ${permission}). Bitte erneut auf „Benachrichtigungen aktivieren“ tippen.`,
      permission,
    };
  }

  const publicKey = getVapidPublicKeyClient();
  if (!publicKey) {
    const msg = "VAPID Public Key fehlt im Client-Bundle.";
    logStep(steps, "subscribe", false, msg);
    return { ok: false, steps, error: msg, permission };
  }

  if (!("serviceWorker" in navigator)) {
    const msg = "Service Worker API nicht verfügbar.";
    logStep(steps, "service_worker_ready", false, msg);
    return { ok: false, steps, error: msg, permission };
  }

  let registration: ServiceWorkerRegistration;
  try {
    let reg = await navigator.serviceWorker.getRegistration("/admin/");
    if (!reg) {
      logStep(steps, "service_worker_ready", true, "Registriere /admin/sw.js …");
      reg = await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" });
    }
    await navigator.serviceWorker.ready;
    registration = reg;
    logStep(steps, "service_worker_ready", true, `SW bereit, scope: ${registration.scope}`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep(steps, "service_worker_ready", false, msg);
    return { ok: false, steps, error: `Service Worker Fehler: ${msg}`, permission };
  }

  if (!registration.pushManager) {
    const msg =
      platform.kind === "ios"
        ? "pushManager fehlt auf der Service-Worker-Registration. App muss vom Home-Bildschirm geöffnet sein (nicht Safari-Tab)."
        : "pushManager fehlt auf der Service-Worker-Registration.";
    logStep(steps, "push_manager", false, msg);
    return { ok: false, steps, error: msg, permission };
  }

  logStep(steps, "push_manager", true, "registration.pushManager vorhanden");

  let subscription: PushSubscription;
  try {
    const existing = await registration.pushManager.getSubscription();
    if (existing) {
      subscription = existing;
      logStep(steps, "subscribe", true, "Bestehende Browser-Subscription wiederverwendet");
    } else {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      logStep(steps, "subscribe", true, `Neue Subscription: ${subscription.endpoint.slice(0, 48)}…`);
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep(steps, "subscribe", false, msg);
    return { ok: false, steps, error: `pushManager.subscribe() fehlgeschlagen: ${msg}`, permission };
  }

  try {
    const payload = subscriptionToStored(subscription);
    const res = await fetch("/api/admin/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string };
    if (!res.ok) {
      const msg = data.error ?? `HTTP ${res.status}`;
      logStep(steps, "save_server", false, msg);
      return { ok: false, steps, error: `Server speichern fehlgeschlagen: ${msg}`, permission };
    }
    logStep(steps, "save_server", true, "Subscription in Datenbank gespeichert");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep(steps, "save_server", false, msg);
    return { ok: false, steps, error: `Server-Request fehlgeschlagen: ${msg}`, permission };
  }

  return { ok: true, steps, error: null, permission };
}

/** Call synchronously inside click handler — iOS requires user gesture. */
export function beginPermissionRequest(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") {
    return Promise.resolve("denied" as NotificationPermission);
  }
  console.error("[push:step] request_permission: Notification.requestPermission() sync gestartet");
  return Notification.requestPermission();
}
