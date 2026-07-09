"use client";

import { getVapidPublicKeyClient } from "@/lib/admin/push/public-config";
import { detectPushPlatform } from "@/lib/admin/push/platform";
import { subscriptionToStored, urlBase64ToUint8Array } from "@/lib/admin/push/client";
import { PUSH_SW_READY_TIMEOUT_MS, withTimeout } from "@/lib/admin/push/timeout";
import type { PushStatusResponse } from "@/lib/admin/push/types";

export type PushActivateStep =
  | "precheck"
  | "request_permission"
  | "permission_result"
  | "service_worker_ready"
  | "push_manager"
  | "subscribe"
  | "verify_subscription"
  | "save_server"
  | "verify_server";

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
  serverSubscribed: boolean;
  serverResponse: string | null;
}

function logStep(steps: PushActivateStepLog[], step: PushActivateStep, ok: boolean, detail: string) {
  const entry = { step, ok, detail };
  steps.push(entry);
  const prefix = ok ? "[push:ok]" : "[push:fail]";
  console.error(`${prefix} ${step}: ${detail}`);
}

function validateSubscriptionShape(subscription: PushSubscription): string | null {
  const json = subscription.toJSON();
  if (!json.endpoint) return "Subscription ohne endpoint";
  if (!json.keys?.p256dh) return "Subscription ohne p256dh";
  if (!json.keys?.auth) return "Subscription ohne auth";
  return null;
}

async function verifyServerSubscription(): Promise<{ ok: boolean; detail: string; subscribed: boolean }> {
  try {
    const res = await fetch("/api/admin/push");
    if (!res.ok) {
      return { ok: false, detail: `Status-API HTTP ${res.status}`, subscribed: false };
    }
    const data = (await res.json()) as PushStatusResponse;
    if (!data.subscribed) {
      return {
        ok: false,
        detail: "Server meldet subscribed=false nach Speichern — DB-Eintrag fehlt oder enabled=false",
        subscribed: false,
      };
    }
    const count = data.diagnostics?.userActiveSubscriptionCount ?? 0;
    if (count < 1) {
      return {
        ok: false,
        detail: "Keine aktive Subscription in DB für aktuellen User",
        subscribed: false,
      };
    }
    return {
      ok: true,
      detail: `DB bestätigt ${count} aktive Subscription(s)`,
      subscribed: true,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, detail: msg, subscribed: false };
  }
}

/**
 * Start subscribe chain synchronously inside click handler.
 * Required on iOS when permission is already granted — async/await before subscribe loses user gesture.
 */
export function beginPushSubscriptionInClick(): Promise<PushSubscription> {
  console.error("[push:step] subscribe: Subscription-Kette synchron gestartet");

  const publicKey = getVapidPublicKeyClient();
  if (!publicKey) {
    return Promise.reject(new Error("VAPID Public Key fehlt im Client-Bundle."));
  }
  if (!("serviceWorker" in navigator)) {
    return Promise.reject(new Error("Service Worker API nicht verfügbar."));
  }

  return navigator.serviceWorker
    .getRegistration("/admin/")
    .then((reg) => reg ?? navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" }))
    .then((reg) =>
      withTimeout(navigator.serviceWorker.ready, PUSH_SW_READY_TIMEOUT_MS, "serviceWorker.ready").then(
        () => reg,
      ),
    )
    .then((reg) => {
      if (!reg.pushManager) {
        const platform = detectPushPlatform();
        throw new Error(
          platform.kind === "ios"
            ? "pushManager fehlt. App muss vom Home-Bildschirm geöffnet sein (nicht Safari-Tab)."
            : "pushManager fehlt auf der Service-Worker-Registration.",
        );
      }
      return reg.pushManager.getSubscription().then((existing) => {
        if (existing) return existing;
        return reg.pushManager!.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
      });
    });
}

export async function runPushActivateFlow(opts: {
  permissionResult: NotificationPermission | Promise<NotificationPermission>;
  configured: boolean;
  subscriptionPromise?: Promise<PushSubscription>;
}): Promise<PushActivateResult> {
  const steps: PushActivateStepLog[] = [];
  const platform = detectPushPlatform();
  let serverResponse: string | null = null;

  if (!opts.configured) {
    const msg = "VAPID Public Key fehlt im Build (NEXT_PUBLIC_VAPID_PUBLIC_KEY).";
    logStep(steps, "precheck", false, msg);
    return { ok: false, steps, error: msg, permission: "default", serverSubscribed: false, serverResponse };
  }

  if (!platform.canSubscribe) {
    const msg = platform.detail;
    logStep(steps, "precheck", false, msg);
    return { ok: false, steps, error: msg, permission: "default", serverSubscribed: false, serverResponse };
  }

  if (typeof Notification === "undefined") {
    const msg = "Notification API nicht verfügbar.";
    logStep(steps, "precheck", false, msg);
    return { ok: false, steps, error: msg, permission: "unavailable", serverSubscribed: false, serverResponse };
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
    return {
      ok: false,
      steps,
      error: `Permission-Anfrage fehlgeschlagen: ${msg}`,
      permission: Notification.permission,
      serverSubscribed: false,
      serverResponse,
    };
  }

  if (permission === "denied") {
    return {
      ok: false,
      steps,
      error: "Benachrichtigungen sind blockiert. Bitte in den Website-Einstellungen erlauben.",
      permission,
      serverSubscribed: false,
      serverResponse,
    };
  }

  if (permission !== "granted") {
    return {
      ok: false,
      steps,
      error: `Permission nicht erteilt (Status: ${permission}). Bitte erneut tippen.`,
      permission,
      serverSubscribed: false,
      serverResponse,
    };
  }

  let subscription: PushSubscription;

  if (opts.subscriptionPromise) {
    try {
      subscription = await opts.subscriptionPromise;
      logStep(steps, "service_worker_ready", true, "SW-Kette aus Klick-Handler abgeschlossen");
      logStep(steps, "push_manager", true, "registration.pushManager vorhanden");
      logStep(
        steps,
        "subscribe",
        true,
        `Subscription aus Klick-Handler: ${subscription.endpoint.slice(0, 48)}…`,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logStep(steps, "subscribe", false, msg);
      return {
        ok: false,
        steps,
        error: `Gerät registrieren fehlgeschlagen: ${msg}`,
        permission,
        serverSubscribed: false,
        serverResponse,
      };
    }
  } else {
    const publicKey = getVapidPublicKeyClient();
    if (!publicKey) {
      const msg = "VAPID Public Key fehlt im Client-Bundle.";
      logStep(steps, "subscribe", false, msg);
      return { ok: false, steps, error: msg, permission, serverSubscribed: false, serverResponse };
    }

    if (!("serviceWorker" in navigator)) {
      const msg = "Service Worker API nicht verfügbar.";
      logStep(steps, "service_worker_ready", false, msg);
      return { ok: false, steps, error: msg, permission, serverSubscribed: false, serverResponse };
    }

    let registration: ServiceWorkerRegistration;
    try {
      let reg = await navigator.serviceWorker.getRegistration("/admin/");
      if (!reg) {
        logStep(steps, "service_worker_ready", true, "Registriere /admin/sw.js …");
        reg = await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" });
      }
      await withTimeout(navigator.serviceWorker.ready, PUSH_SW_READY_TIMEOUT_MS, "serviceWorker.ready");
      registration = reg;
      logStep(steps, "service_worker_ready", true, `SW bereit, scope: ${registration.scope}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logStep(steps, "service_worker_ready", false, msg);
      return { ok: false, steps, error: `Service Worker Fehler: ${msg}`, permission, serverSubscribed: false, serverResponse };
    }

    if (!registration.pushManager) {
      const msg =
        platform.kind === "ios"
          ? "pushManager fehlt auf der Service-Worker-Registration. App muss vom Home-Bildschirm geöffnet sein (nicht Safari-Tab)."
          : "pushManager fehlt auf der Service-Worker-Registration.";
      logStep(steps, "push_manager", false, msg);
      return { ok: false, steps, error: msg, permission, serverSubscribed: false, serverResponse };
    }

    logStep(steps, "push_manager", true, "registration.pushManager vorhanden");

    try {
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        subscription = existing;
        logStep(steps, "subscribe", true, "Bestehende Browser-Subscription gefunden");
      } else {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        });
        logStep(steps, "subscribe", true, `Neue Subscription erstellt: ${subscription.endpoint.slice(0, 48)}…`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logStep(steps, "subscribe", false, msg);
      return { ok: false, steps, error: `pushManager.subscribe() fehlgeschlagen: ${msg}`, permission, serverSubscribed: false, serverResponse };
    }
  }

  const shapeError = validateSubscriptionShape(subscription);
  if (shapeError) {
    logStep(steps, "verify_subscription", false, shapeError);
    return { ok: false, steps, error: shapeError, permission, serverSubscribed: false, serverResponse };
  }
  logStep(steps, "verify_subscription", true, "endpoint, p256dh und auth vorhanden");

  let payload;
  try {
    payload = subscriptionToStored(subscription);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep(steps, "verify_subscription", false, msg);
    return { ok: false, steps, error: msg, permission, serverSubscribed: false, serverResponse };
  }

  try {
    const res = await fetch("/api/admin/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { error?: string; subscriptionId?: string; success?: boolean };
    serverResponse = JSON.stringify({ status: res.status, ...data });
    if (!res.ok) {
      const msg = data.error ?? `HTTP ${res.status}`;
      logStep(steps, "save_server", false, msg);
      return {
        ok: false,
        steps,
        error: `Server speichern fehlgeschlagen: ${msg}`,
        permission,
        serverSubscribed: false,
        serverResponse,
      };
    }
    logStep(
      steps,
      "save_server",
      true,
      `Subscription gespeichert (id: ${data.subscriptionId ?? "unbekannt"}, HTTP ${res.status})`,
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep(steps, "save_server", false, msg);
    return {
      ok: false,
      steps,
      error: `Server-Request fehlgeschlagen: ${msg}`,
      permission,
      serverSubscribed: false,
      serverResponse,
    };
  }

  const verify = await verifyServerSubscription();
  logStep(steps, "verify_server", verify.ok, verify.detail);
  if (!verify.ok) {
    return {
      ok: false,
      steps,
      error: `Gerät nicht in DB registriert: ${verify.detail}`,
      permission,
      serverSubscribed: false,
      serverResponse,
    };
  }

  return { ok: true, steps, error: null, permission, serverSubscribed: true, serverResponse };
}

/** Call synchronously inside click handler — iOS requires user gesture. */
export function beginPermissionRequest(): Promise<NotificationPermission> {
  if (typeof Notification === "undefined") {
    return Promise.reject(new Error("Notification API nicht verfügbar."));
  }
  if (Notification.permission === "granted") {
    console.error("[push:step] request_permission: bereits granted (sync)");
    return Promise.resolve("granted");
  }
  if (Notification.permission === "denied") {
    console.error("[push:step] request_permission: bereits denied (sync)");
    return Promise.resolve("denied");
  }
  console.error("[push:step] request_permission: Notification.requestPermission() sync gestartet");
  return Notification.requestPermission();
}
