"use client";

export type PushPlatformKind = "android" | "ios" | "desktop" | "unknown";

export type PushPlatformSupportLevel = "supported" | "ios_pwa_required" | "unsupported";

export interface PushPlatformInfo {
  kind: PushPlatformKind;
  support: PushPlatformSupportLevel;
  label: string;
  detail: string;
  canSubscribe: boolean;
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  if (nav.standalone === true) return true;
  return ["standalone", "fullscreen", "minimal-ui"].some((mode) =>
    window.matchMedia(`(display-mode: ${mode})`).matches,
  );
}

export function hasPushApis(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Android/Edge/Samsung + iOS 16.4+ installed PWA. */
export function detectPushPlatform(): PushPlatformInfo {
  if (!hasPushApis()) {
    return {
      kind: "unknown",
      support: "unsupported",
      label: "Browser nicht unterstützt",
      detail: "Dieser Browser unterstützt Web Push nicht (Service Worker / PushManager / Notifications fehlen).",
      canSubscribe: false,
    };
  }

  if (isIosDevice()) {
    if (isStandaloneDisplay()) {
      return {
        kind: "ios",
        support: "supported",
        label: "iOS unterstützt",
        detail: "Push funktioniert in der installierten Home-Bildschirm-PWA (iOS 16.4+).",
        canSubscribe: true,
      };
    }
    return {
      kind: "ios",
      support: "ios_pwa_required",
      label: "iOS: PWA erforderlich",
      detail:
        "Auf iPhone/iPad funktioniert Push nur in der installierten Admin-PWA vom Home-Bildschirm — nicht im Safari-Tab.",
      canSubscribe: false,
    };
  }

  if (isAndroidDevice()) {
    return {
      kind: "android",
      support: "supported",
      label: "Android unterstützt",
      detail: "Push funktioniert in Chrome, Edge und Samsung Internet (Permission + Subscription erforderlich).",
      canSubscribe: true,
    };
  }

  return {
    kind: "desktop",
    support: "supported",
    label: "Desktop/Chromium unterstützt",
    detail: "Push funktioniert in Chrome und Edge auf dem Desktop.",
    canSubscribe: true,
  };
}
