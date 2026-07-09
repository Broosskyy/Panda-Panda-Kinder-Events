"use client";

import { detectPushPlatform, hasBasicNotificationSupport } from "@/lib/admin/push/platform";
import { getVapidPublicKeyClient } from "@/lib/admin/push/public-config";
import { PUSH_SW_READY_TIMEOUT_MS, withTimeout } from "@/lib/admin/push/timeout";
import type { PushDiagnostics } from "@/lib/admin/push/types";

export interface PushLiveDebugState {
  notificationPermission: string;
  hasNotificationApi: boolean;
  hasServiceWorkerApi: boolean;
  pushManagerOnWindow: boolean;
  vapidPublicKeyPresent: boolean;
  serviceWorkerRegistered: boolean;
  serviceWorkerReady: boolean;
  pushManagerOnRegistration: boolean;
  browserSubscriptionPresent: boolean;
  serverSubscriptionSaved: boolean;
  userActiveSubscriptionCount: number;
  totalAdminSubscriptionCount: number;
  receivesInquiryPush: boolean;
  roleSlug: string;
  browserUserAgent: string;
  platformLabel: string;
  platformDetail: string;
  platformCanSubscribe: boolean;
  displayStandalone: boolean;
  navigatorStandalone: boolean;
  lastError: string | null;
  lastServerResponse: string | null;
  lastTestPush: string | null;
  checkedAt: string;
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return ["standalone", "fullscreen", "minimal-ui"].some((mode) =>
    window.matchMedia(`(display-mode: ${mode})`).matches,
  );
}

async function fetchServerDiagnostics(): Promise<Partial<PushDiagnostics>> {
  try {
    const res = await withTimeout(fetch("/api/admin/push"), 8_000, "Push-Status API");
    if (!res.ok) return {};
    const data = await res.json();
    return data.diagnostics ?? {};
  } catch {
    return {};
  }
}

async function readServiceWorkerState(): Promise<{
  serviceWorkerRegistered: boolean;
  serviceWorkerReady: boolean;
  pushManagerOnRegistration: boolean;
  browserSubscriptionPresent: boolean;
  error: string | null;
}> {
  let serviceWorkerRegistered = false;
  let serviceWorkerReady = false;
  let pushManagerOnRegistration = false;
  let browserSubscriptionPresent = false;

  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return {
      serviceWorkerRegistered,
      serviceWorkerReady,
      pushManagerOnRegistration,
      browserSubscriptionPresent,
      error: "Service Worker API nicht verfügbar",
    };
  }

  try {
    const reg = await navigator.serviceWorker.getRegistration("/admin/");
    serviceWorkerRegistered = Boolean(reg);
    if (reg) {
      pushManagerOnRegistration = "pushManager" in reg && Boolean(reg.pushManager);
      if (reg.pushManager) {
        const sub = await reg.pushManager.getSubscription();
        browserSubscriptionPresent = Boolean(sub);
      }
    }

    await withTimeout(navigator.serviceWorker.ready, PUSH_SW_READY_TIMEOUT_MS, "serviceWorker.ready");
    serviceWorkerReady = true;

    if (!serviceWorkerRegistered) {
      const readyReg = await navigator.serviceWorker.getRegistration("/admin/");
      serviceWorkerRegistered = Boolean(readyReg);
      if (readyReg) {
        pushManagerOnRegistration = "pushManager" in readyReg && Boolean(readyReg.pushManager);
        if (readyReg.pushManager) {
          const sub = await readyReg.pushManager.getSubscription();
          browserSubscriptionPresent = Boolean(sub);
        }
      }
    }
    return {
      serviceWorkerRegistered,
      serviceWorkerReady,
      pushManagerOnRegistration,
      browserSubscriptionPresent,
      error: null,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      serviceWorkerRegistered,
      serviceWorkerReady,
      pushManagerOnRegistration,
      browserSubscriptionPresent,
      error: msg,
    };
  }
}

/** Immediate snapshot (no async SW wait) — shown while full diagnose loads. */
export function buildSyncPushDebugSnapshot(opts?: {
  lastError?: string | null;
  lastServerResponse?: string | null;
  lastTestPush?: string | null;
}): PushLiveDebugState {
  const platform = detectPushPlatform();
  const permission =
    typeof Notification !== "undefined" ? Notification.permission : "unavailable";

  return {
    notificationPermission: permission,
    hasNotificationApi: typeof Notification !== "undefined",
    hasServiceWorkerApi: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    pushManagerOnWindow: typeof window !== "undefined" && "PushManager" in window,
    vapidPublicKeyPresent: Boolean(getVapidPublicKeyClient()),
    serviceWorkerRegistered: false,
    serviceWorkerReady: false,
    pushManagerOnRegistration: false,
    browserSubscriptionPresent: false,
    serverSubscriptionSaved: false,
    userActiveSubscriptionCount: 0,
    totalAdminSubscriptionCount: 0,
    receivesInquiryPush: false,
    roleSlug: "…",
    browserUserAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    platformLabel: platform.label,
    platformDetail: platform.detail,
    platformCanSubscribe: platform.canSubscribe,
    displayStandalone: isStandaloneDisplay(),
    navigatorStandalone:
      typeof navigator !== "undefined"
        ? (navigator as Navigator & { standalone?: boolean }).standalone === true
        : false,
    lastError: opts?.lastError ?? null,
    lastServerResponse: opts?.lastServerResponse ?? null,
    lastTestPush: opts?.lastTestPush ?? null,
    checkedAt: new Date().toISOString(),
  };
}

export async function collectPushLiveDebugState(opts?: {
  serverSubscribed?: boolean;
  lastError?: string | null;
  lastServerResponse?: string | null;
  lastTestPush?: string | null;
}): Promise<PushLiveDebugState> {
  const platform = detectPushPlatform();
  const permission =
    typeof Notification !== "undefined" ? Notification.permission : "unavailable";

  const [swState, diagnostics] = await Promise.all([
    readServiceWorkerState(),
    fetchServerDiagnostics(),
  ]);

  const serverCount = diagnostics.userActiveSubscriptionCount ?? 0;

  return {
    notificationPermission: permission,
    hasNotificationApi: typeof Notification !== "undefined",
    hasServiceWorkerApi: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    pushManagerOnWindow: typeof window !== "undefined" && "PushManager" in window,
    vapidPublicKeyPresent: Boolean(getVapidPublicKeyClient()),
    serviceWorkerRegistered: swState.serviceWorkerRegistered,
    serviceWorkerReady: swState.serviceWorkerReady,
    pushManagerOnRegistration: swState.pushManagerOnRegistration,
    browserSubscriptionPresent: swState.browserSubscriptionPresent,
    serverSubscriptionSaved: Boolean(opts?.serverSubscribed ?? serverCount > 0),
    userActiveSubscriptionCount: serverCount,
    totalAdminSubscriptionCount: diagnostics.totalAdminSubscriptionCount ?? 0,
    receivesInquiryPush: diagnostics.receivesInquiryPush ?? false,
    roleSlug: diagnostics.roleSlug ?? "unknown",
    browserUserAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    platformLabel: platform.label,
    platformDetail: platform.detail,
    platformCanSubscribe: platform.canSubscribe,
    displayStandalone: isStandaloneDisplay(),
    navigatorStandalone:
      typeof navigator !== "undefined"
        ? (navigator as Navigator & { standalone?: boolean }).standalone === true
        : false,
    lastError: opts?.lastError ?? swState.error,
    lastServerResponse: opts?.lastServerResponse ?? null,
    lastTestPush: opts?.lastTestPush ?? null,
    checkedAt: new Date().toISOString(),
  };
}

export function hasBasicNotificationSupportClient(): boolean {
  return hasBasicNotificationSupport();
}
