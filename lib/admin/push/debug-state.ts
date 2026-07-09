"use client";

import { detectPushPlatform, hasBasicNotificationSupport } from "@/lib/admin/push/platform";
import { getVapidPublicKeyClient } from "@/lib/admin/push/public-config";

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
  browserUserAgent: string;
  platformLabel: string;
  platformDetail: string;
  platformCanSubscribe: boolean;
  displayStandalone: boolean;
  navigatorStandalone: boolean;
  lastError: string | null;
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

export async function collectPushLiveDebugState(opts?: {
  serverSubscribed?: boolean;
  lastError?: string | null;
}): Promise<PushLiveDebugState> {
  const platform = detectPushPlatform();
  const permission =
    typeof Notification !== "undefined" ? Notification.permission : "unavailable";

  let serviceWorkerRegistered = false;
  let serviceWorkerReady = false;
  let pushManagerOnRegistration = false;
  let browserSubscriptionPresent = false;

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
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
      await navigator.serviceWorker.ready;
      serviceWorkerReady = true;
      if (!serviceWorkerRegistered) {
        const readyReg = await navigator.serviceWorker.getRegistration("/admin/");
        serviceWorkerRegistered = Boolean(readyReg);
        if (readyReg) {
          pushManagerOnRegistration = "pushManager" in readyReg && Boolean(readyReg.pushManager);
        }
      }
    } catch (error) {
      return {
        notificationPermission: permission,
        hasNotificationApi: typeof Notification !== "undefined",
        hasServiceWorkerApi: true,
        pushManagerOnWindow: typeof window !== "undefined" && "PushManager" in window,
        vapidPublicKeyPresent: Boolean(getVapidPublicKeyClient()),
        serviceWorkerRegistered,
        serviceWorkerReady,
        pushManagerOnRegistration,
        browserSubscriptionPresent,
        serverSubscriptionSaved: Boolean(opts?.serverSubscribed),
        browserUserAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        platformLabel: platform.label,
        platformDetail: platform.detail,
        platformCanSubscribe: platform.canSubscribe,
        displayStandalone: isStandaloneDisplay(),
        navigatorStandalone:
          typeof navigator !== "undefined"
            ? (navigator as Navigator & { standalone?: boolean }).standalone === true
            : false,
        lastError: error instanceof Error ? error.message : String(error),
        checkedAt: new Date().toISOString(),
      };
    }
  }

  return {
    notificationPermission: permission,
    hasNotificationApi: typeof Notification !== "undefined",
    hasServiceWorkerApi: typeof navigator !== "undefined" && "serviceWorker" in navigator,
    pushManagerOnWindow: typeof window !== "undefined" && "PushManager" in window,
    vapidPublicKeyPresent: Boolean(getVapidPublicKeyClient()),
    serviceWorkerRegistered,
    serviceWorkerReady,
    pushManagerOnRegistration,
    browserSubscriptionPresent,
    serverSubscriptionSaved: Boolean(opts?.serverSubscribed),
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
    checkedAt: new Date().toISOString(),
  };
}

export function hasBasicNotificationSupportClient(): boolean {
  return hasBasicNotificationSupport();
}
