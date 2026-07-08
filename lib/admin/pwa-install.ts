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

export const PWA_SW_RELOAD_KEY = "pb-admin-pwa-sw-reload-done";

export interface PwaProbeResult {
  state: PwaInstallabilityState;
  manifestLoaded: boolean;
  manifestValid: boolean;
  icons192Ok: boolean;
  icons512Ok: boolean;
  icons192MimeOk: boolean;
  icons512MimeOk: boolean;
  serviceWorkerRegistered: boolean;
  serviceWorkerActive: boolean;
  serviceWorkerControlling: boolean;
  offlineCapable: boolean;
  installPromptAvailable: boolean;
  https: boolean;
  issues: string[];
  blockers: string[];
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
    __pbPwaPromptFired?: boolean;
    __pbPwaInstalledFired?: boolean;
    __pbPwaEarlyCaptureBound?: boolean;
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

export type PwaInstallCause =
  | "already_standalone"
  | "browser_unsupported"
  | "prompt_not_yet_fired"
  | "prompt_dismissed_by_user"
  | "sw_not_controlling"
  | "technical_blocker"
  | "in_app_browser";

export interface PwaDebugStatus {
  manifestReachable: boolean;
  serviceWorkerRegistered: boolean;
  serviceWorkerControlling: boolean;
  https: boolean;
  iconsReachable: boolean;
  displayModeStandalone: boolean;
  beforeInstallPromptFired: boolean;
  deferredPromptStored: boolean;
  appInstalledFired: boolean;
  installDismissedLocal: boolean;
  browserProfile: string;
  currentRoute: string;
  startUrl: string;
  scope: string;
  detectedCause: PwaInstallCause | null;
  causeMessage: string | null;
}

export function readPromptFiredFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.__pbPwaPromptFired === true;
}

export function readAppInstalledFiredFlag(): boolean {
  if (typeof window === "undefined") return false;
  return window.__pbPwaInstalledFired === true;
}

export function isInAppBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /(FBAN|FBAV|Instagram|Line\/|Twitter|LinkedInApp|wv\))/i.test(ua);
}

export function detectBrowserProfile(): string {
  if (typeof navigator === "undefined") return "unbekannt";
  const ua = navigator.userAgent;
  if (isInAppBrowser()) return "In-App-Browser (kein Chrome)";
  if (isIosDevice()) return "Safari iOS";
  if (/android/i.test(ua) && /chrome/i.test(ua)) return "Chrome Android";
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return "Chrome Desktop";
  if (/edg/i.test(ua)) return "Edge";
  if (/firefox/i.test(ua)) return "Firefox";
  return "anderer Browser";
}

/** Clears only PWA hint/dismiss flags — no user or CMS data. */
export function resetPwaInstallHints(): void {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(PWA_HIDE_STORAGE_KEY);
    localStorage.removeItem(PWA_DISMISS_STORAGE_KEY);
    localStorage.removeItem(PWA_INSTALLED_STORAGE_KEY);
  }
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(PWA_SESSION_CLOSED_KEY);
    sessionStorage.removeItem(PWA_SW_RELOAD_KEY);
  }
}

export function detectPwaInstallCause(
  probe: PwaProbeResult,
  opts: { promptDismissedRecently?: boolean } = {},
): { cause: PwaInstallCause | null; message: string | null } {
  if (probe.state === "installed" || isStandalonePwa()) {
    return {
      cause: "already_standalone",
      message: "Die Admin-App läuft bereits im Vollbildmodus (standalone).",
    };
  }
  if (isInAppBrowser()) {
    return {
      cause: "in_app_browser",
      message:
        "In-App-Browser erkannt — bitte die Seite in Chrome öffnen (Menü → „In Chrome öffnen“).",
    };
  }
  if (probe.state === "browser_unsupported" || !supportsNativePwaInstall()) {
    return {
      cause: "browser_unsupported",
      message: "Dieser Browser unterstützt keinen nativen Install-Prompt — manuelle Installation nutzen.",
    };
  }
  if (!probe.manifestValid || !probe.icons192Ok || !probe.icons512Ok || !probe.https) {
    return {
      cause: "technical_blocker",
      message: "Technische PWA-Kriterien sind noch nicht vollständig erfüllt — siehe Diagnose.",
    };
  }
  if (probe.serviceWorkerActive && !probe.serviceWorkerControlling) {
    return {
      cause: "sw_not_controlling",
      message:
        "Der Service Worker kontrolliert diese Seite noch nicht — Seite einmal neu laden und erneut prüfen.",
    };
  }
  if (opts.promptDismissedRecently) {
    return {
      cause: "prompt_dismissed_by_user",
      message:
        "Der Installationsdialog wurde zuvor abgelehnt — Chrome blockiert den Prompt temporär. Manuelle Installation über das Chrome-Menü nutzen.",
    };
  }
  if (!probe.installPromptAvailable && !readPromptFiredFlag()) {
    return {
      cause: "prompt_not_yet_fired",
      message:
        "Chrome stellt aktuell keinen Installationsdialog bereit. Manuelle Installation über Chrome-Menü → „App installieren“ oder „Zum Startbildschirm hinzufügen“. Fehlt die Option, erkennt Chrome die Seite noch nicht als installierbar oder blockiert den Prompt temporär.",
    };
  }
  return { cause: null, message: null };
}

export async function buildPwaDebugStatus(
  probe: PwaProbeResult,
  opts: { promptDismissedRecently?: boolean } = {},
): Promise<PwaDebugStatus> {
  const detected = detectPwaInstallCause(probe, opts);
  return {
    manifestReachable: probe.manifestLoaded && probe.manifestValid,
    serviceWorkerRegistered: probe.serviceWorkerRegistered,
    serviceWorkerControlling: probe.serviceWorkerControlling,
    https: probe.https,
    iconsReachable: probe.icons192Ok && probe.icons512Ok,
    displayModeStandalone: isStandalonePwa(),
    beforeInstallPromptFired: readPromptFiredFlag(),
    deferredPromptStored: Boolean(takeEarlyCapturedPrompt()),
    appInstalledFired: readAppInstalledFiredFlag(),
    installDismissedLocal: readPwaDontShowAgain(),
    browserProfile: detectBrowserProfile(),
    currentRoute: typeof window !== "undefined" ? window.location.pathname : "/admin",
    startUrl: "/admin",
    scope: "/admin",
    detectedCause: detected.cause,
    causeMessage: detected.message,
  };
}

async function checkIconUrl(path: string): Promise<{ ok: boolean; mimeOk: boolean }> {
  try {
    const res = await fetch(path, { method: "HEAD", cache: "no-store" });
    const type = res.headers.get("content-type") ?? "";
    const mimeOk = type.includes("image/png") || type.includes("image/");
    return { ok: res.ok, mimeOk: res.ok ? mimeOk : false };
  } catch {
    return { ok: false, mimeOk: false };
  }
}

export function explainPwaBlockers(result: PwaProbeResult): string[] {
  const messages: string[] = [];
  if (!result.https) messages.push("Die Seite muss über HTTPS erreichbar sein.");
  if (!result.manifestLoaded) messages.push("Das Web-App-Manifest konnte nicht geladen werden.");
  if (result.manifestLoaded && !result.manifestValid) {
    messages.push("Das Manifest ist unvollständig (start_url, scope oder display).");
  }
  if (!result.icons192Ok || !result.icons512Ok) {
    messages.push("Die App-Icons (192×192 / 512×512) sind nicht erreichbar.");
  }
  if (result.icons192Ok && !result.icons192MimeOk) {
    messages.push("Das 192×192-Icon hat keinen gültigen PNG-MIME-Type.");
  }
  if (result.icons512Ok && !result.icons512MimeOk) {
    messages.push("Das 512×512-Icon hat keinen gültigen PNG-MIME-Type.");
  }
  if (!result.serviceWorkerRegistered) {
    messages.push("Kein Service Worker für /admin registriert.");
  }
  if (result.serviceWorkerRegistered && !result.serviceWorkerActive) {
    messages.push("Der Service Worker ist registriert, aber noch nicht aktiv.");
  }
  if (result.serviceWorkerActive && !result.serviceWorkerControlling) {
    messages.push(
      "Der Service Worker kontrolliert diese Seite noch nicht — Chrome feuert beforeinstallprompt oft erst nach einem Seiten-Reload.",
    );
  }
  if (
    result.manifestValid &&
    result.serviceWorkerActive &&
    result.serviceWorkerControlling &&
    result.icons192Ok &&
    result.icons512Ok &&
    !result.installPromptAvailable
  ) {
    messages.push(
      "Alle technischen Kriterien sind erfüllt, aber Chrome meldet keinen Install-Prompt. Mögliche Ursachen: App bereits installiert, Prompt zuvor abgelehnt, In-App-Browser statt Chrome, oder Chromes Engagement-Heuristik (häufig erst nach erneutem Besuch / längerer Nutzung).",
    );
  }
  return messages;
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
      if (issues.includes("sw_not_controlling")) return "Service Worker kontrolliert Seite nicht";
      if (issues.includes("prompt_pending")) return "Install-Prompt noch nicht verfügbar";
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
          (manifest.start_url === "/admin" || String(manifest.start_url).endsWith("/admin")) &&
          (manifest.scope === "/admin" || manifest.scope === "/admin/") &&
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

  const icon192 = await checkIconUrl(`${BRAND.assets.icon192}?v=${BRAND.iconVersion}`);
  const icon512 = await checkIconUrl(`${BRAND.assets.icon512}?v=${BRAND.iconVersion}`);
  const icons192Ok = icon192.ok;
  const icons512Ok = icon512.ok;
  const icons192MimeOk = icon192.mimeOk;
  const icons512MimeOk = icon512.mimeOk;
  if (!icons192Ok || !icons512Ok) issues.push("icons_missing");
  if (icons192Ok && !icons192MimeOk) issues.push("icon192_mime");
  if (icons512Ok && !icons512MimeOk) issues.push("icon512_mime");

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
      if (serviceWorkerActive && !serviceWorkerControlling) issues.push("sw_not_controlling");
      if (!offlineCapable) issues.push("offline_missing");
    } catch {
      issues.push("service_worker_missing");
    }
  } else {
    issues.push("browser_unsupported");
  }

  const standalone = resolvePwaInstalled();
  const installPromptAvailable = Boolean(deferred);

  if (
    !standalone &&
    manifestValid &&
    serviceWorkerActive &&
    serviceWorkerControlling &&
    icons192Ok &&
    icons512Ok &&
    https &&
    !installPromptAvailable
  ) {
    issues.push("prompt_pending");
  }

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
    icons192MimeOk,
    icons512MimeOk,
    serviceWorkerRegistered,
    serviceWorkerActive,
    serviceWorkerControlling,
    offlineCapable,
    installPromptAvailable,
    https,
    issues,
    blockers: explainPwaBlockers({
      state,
      manifestLoaded,
      manifestValid,
      icons192Ok,
      icons512Ok,
      icons192MimeOk,
      icons512MimeOk,
      serviceWorkerRegistered,
      serviceWorkerActive,
      serviceWorkerControlling,
      offlineCapable,
      installPromptAvailable,
      https,
      issues,
      blockers: [],
      statusLabel: "",
      checkedAt: "",
    }),
    statusLabel: buildStatusLabel(state, issues),
    checkedAt: new Date().toISOString(),
  };
}

const SW_PATHS = ["/admin/sw.js", "/admin-sw.js"] as const;

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;

  let reg: ServiceWorkerRegistration | null = null;
  for (const path of SW_PATHS) {
    try {
      reg = await navigator.serviceWorker.register(path, { scope: "/admin/" });
      break;
    } catch {
      continue;
    }
  }
  if (!reg) {
    console.warn("[pwa] registration failed for all SW paths");
    return null;
  }

  try {
    if (reg.installing || reg.waiting) {
      await new Promise<void>((resolve) => {
        const worker = reg?.installing ?? reg?.waiting;
        const timeout = window.setTimeout(resolve, 4000);
        worker?.addEventListener("statechange", function onChange() {
          if (worker.state === "activated" || reg?.active) {
            worker.removeEventListener("statechange", onChange);
            window.clearTimeout(timeout);
            resolve();
          }
        });
      });
    }
    await navigator.serviceWorker.ready.catch(() => undefined);

    if (!navigator.serviceWorker.controller && typeof sessionStorage !== "undefined") {
      const reloaded = sessionStorage.getItem(PWA_SW_RELOAD_KEY) === "1";
      if (!reloaded && reg.active) {
        sessionStorage.setItem(PWA_SW_RELOAD_KEY, "1");
        window.location.reload();
      }
    }
  } catch (err) {
    console.warn("[pwa] activation wait failed", err);
  }

  return reg;
}
