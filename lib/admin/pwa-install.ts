import { BRAND } from "@/lib/brand";

export const PWA_HIDE_STORAGE_KEY = "pb-admin-pwa-install-hidden";
/** @deprecated Use PWA_HIDE_STORAGE_KEY — kept for migration */
export const PWA_DISMISS_STORAGE_KEY = "pb-admin-pwa-install-dismissed";
export const PWA_INSTALLED_STORAGE_KEY = "pb-admin-pwa-installed";
export const PWA_SESSION_CLOSED_KEY = "pb-admin-pwa-card-closed";

export type PwaInstallOutcome = "accepted" | "dismissed" | "unavailable";

export type PwaInstallabilityState =
  | "installed"
  | "installable"
  | "not_installable"
  | "browser_unsupported";

export interface PwaProbeResult {
  state: PwaInstallabilityState;
  manifestLoaded: boolean;
  manifestValid: boolean;
  icons192Ok: boolean;
  icons512Ok: boolean;
  serviceWorkerRegistered: boolean;
  serviceWorkerActive: boolean;
  serviceWorkerControlling: boolean;
  offlineCapable: boolean;
  installPromptAvailable: boolean;
  https: boolean;
  issues: string[];
  statusLabel: string;
  checkedAt: string;
}

export function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android/i.test(navigator.userAgent);
}

export function supportsNativePwaInstall(): boolean {
  if (typeof window === "undefined") return false;
  return !isIosDevice() && "serviceWorker" in navigator;
}

export function readPwaDontShowAgain(): boolean {
  if (typeof localStorage === "undefined") return false;
  return (
    localStorage.getItem(PWA_HIDE_STORAGE_KEY) === "1" ||
    localStorage.getItem(PWA_DISMISS_STORAGE_KEY) === "1"
  );
}

export function markPwaDontShowAgain(): void {
  localStorage.setItem(PWA_HIDE_STORAGE_KEY, "1");
  localStorage.removeItem(PWA_DISMISS_STORAGE_KEY);
}

/** Temporary close for current browser session only. */
export function markPwaSessionClosed(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(PWA_SESSION_CLOSED_KEY, "1");
}

export function readPwaSessionClosed(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  return sessionStorage.getItem(PWA_SESSION_CLOSED_KEY) === "1";
}

export function clearPwaSessionClosed(): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(PWA_SESSION_CLOSED_KEY);
}

export function markPwaInstalled(): void {
  localStorage.setItem(PWA_INSTALLED_STORAGE_KEY, "1");
  localStorage.removeItem(PWA_HIDE_STORAGE_KEY);
  localStorage.removeItem(PWA_DISMISS_STORAGE_KEY);
  clearPwaSessionClosed();
}

export function readPwaInstalledFlag(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(PWA_INSTALLED_STORAGE_KEY) === "1";
}

export function clearPwaInstalledFlag(): void {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem(PWA_INSTALLED_STORAGE_KEY);
}

/** Resolve install state: standalone wins; stale flags cleared when not standalone. */
export function resolvePwaInstalled(): boolean {
  if (isStandalonePwa()) {
    markPwaInstalled();
    return true;
  }
  return false;
}

declare global {
  interface Window {
    __pbPwaDeferredPrompt?: Event & {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
    };
  }
}

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function takeEarlyCapturedPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === "undefined") return null;
  return window.__pbPwaDeferredPrompt ?? null;
}

export function storeDeferredPrompt(event: BeforeInstallPromptEvent): void {
  if (typeof window !== "undefined") {
    window.__pbPwaDeferredPrompt = event;
  }
}

export function clearDeferredPrompt(): void {
  if (typeof window !== "undefined") {
    window.__pbPwaDeferredPrompt = undefined;
  }
}

async function checkIconUrl(path: string): Promise<boolean> {
  try {
    const res = await fetch(path, { method: "HEAD", cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

function buildStatusLabel(state: PwaInstallabilityState, issues: string[]): string {
  switch (state) {
    case "installed":
      return "Bereits installiert";
    case "installable":
      return "Installierbar";
    case "browser_unsupported":
      return "Browser nicht unterstützt";
    case "not_installable":
      if (issues.includes("manifest_missing")) return "Manifest fehlt";
      if (issues.includes("service_worker_missing")) return "Service Worker fehlt";
      if (issues.includes("icons_missing")) return "Icon fehlt";
      if (issues.includes("offline_missing")) return "Offlinefähigkeit fehlt";
      return "Nicht installierbar";
    default:
      return "Unbekannt";
  }
}

export async function probePwaInstallability(
  deferred: BeforeInstallPromptEvent | null,
): Promise<PwaProbeResult> {
  const issues: string[] = [];
  const https =
    typeof window !== "undefined" &&
    (window.location.protocol === "https:" || window.location.hostname === "localhost");

  if (!https) issues.push("https_required");

  let manifestLoaded = false;
  let manifestValid = false;
  try {
    const res = await fetch("/admin/manifest.webmanifest", { cache: "no-store" });
    manifestLoaded = res.ok;
    if (!res.ok) {
      issues.push("manifest_missing");
    } else {
      const manifest = (await res.json()) as {
        name?: string;
        start_url?: string;
        scope?: string;
        display?: string;
        icons?: { sizes?: string }[];
      };
      manifestValid = Boolean(
        manifest.name &&
          manifest.start_url === "/admin" &&
          manifest.scope === "/admin" &&
          manifest.display === "standalone" &&
          Array.isArray(manifest.icons) &&
          manifest.icons.length > 0,
      );
      if (!manifestValid) issues.push("manifest_invalid");
    }
  } catch {
    manifestLoaded = false;
    issues.push("manifest_missing");
  }

  const [icons192Ok, icons512Ok] = await Promise.all([
    checkIconUrl(`${BRAND.assets.icon192}?v=${BRAND.iconVersion}`),
    checkIconUrl(`${BRAND.assets.icon512}?v=${BRAND.iconVersion}`),
  ]);
  if (!icons192Ok || !icons512Ok) issues.push("icons_missing");

  let serviceWorkerRegistered = false;
  let serviceWorkerActive = false;
  let serviceWorkerControlling = false;
  let offlineCapable = false;

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/admin");
      serviceWorkerRegistered = Boolean(reg);
      serviceWorkerActive = Boolean(reg?.active);
      serviceWorkerControlling = Boolean(navigator.serviceWorker.controller);
      offlineCapable = serviceWorkerActive;
      if (!serviceWorkerRegistered) issues.push("service_worker_missing");
      else if (!serviceWorkerActive) issues.push("service_worker_inactive");
      if (!offlineCapable) issues.push("offline_missing");
    } catch {
      issues.push("service_worker_missing");
    }
  } else {
    issues.push("browser_unsupported");
  }

  const standalone = resolvePwaInstalled();
  const installPromptAvailable = Boolean(deferred);

  let state: PwaInstallabilityState;
  if (standalone) {
    state = "installed";
  } else if (!("serviceWorker" in navigator)) {
    state = "browser_unsupported";
  } else if (installPromptAvailable && manifestValid && serviceWorkerActive && icons192Ok && icons512Ok) {
    state = "installable";
  } else {
    state = "not_installable";
  }

  return {
    state,
    manifestLoaded,
    manifestValid,
    icons192Ok,
    icons512Ok,
    serviceWorkerRegistered,
    serviceWorkerActive,
    serviceWorkerControlling,
    offlineCapable,
    installPromptAvailable,
    https,
    issues,
    statusLabel: buildStatusLabel(state, issues),
    checkedAt: new Date().toISOString(),
  };
}

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register("/admin-sw.js", { scope: "/admin" });
    if (reg.installing) {
      await new Promise<void>((resolve) => {
        reg.installing?.addEventListener("statechange", function onChange() {
          if (reg.installing?.state === "activated" || reg.active) {
            reg.installing?.removeEventListener("statechange", onChange);
            resolve();
          }
        });
        setTimeout(resolve, 3000);
      });
    }
    await navigator.serviceWorker.ready.catch(() => undefined);
    return reg;
  } catch (err) {
    console.warn("[pwa] registration failed", err);
    return null;
  }
}
