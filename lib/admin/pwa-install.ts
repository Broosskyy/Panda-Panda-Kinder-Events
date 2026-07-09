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

export const PWA_SW_RELOAD_KEY = "pb-admin-pwa-sw-reload-v2";

export interface PwaProbeResult {
  state: PwaInstallabilityState;
  manifestLoaded: boolean;
  manifestValid: boolean;
  icons192Ok: boolean;
  icons512Ok: boolean;
  icons192MimeOk: boolean;
  icons512MimeOk: boolean;
  iconsMaskable192Ok: boolean;
  iconsMaskable512Ok: boolean;
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
  installMode: PwaInstallMode;
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

export type PwaBrowserId =
  | "chrome_android"
  | "chrome_desktop"
  | "edge"
  | "safari_ios"
  | "firefox"
  | "samsung_internet"
  | "in_app_browser"
  | "other";

export type PwaInstallMethod =
  | "native_prompt"
  | "manual_ios"
  | "manual_firefox"
  | "manual_samsung"
  | "unknown";

export interface PwaBrowserInfo {
  id: PwaBrowserId;
  label: string;
  supportsBeforeInstallPrompt: boolean;
  installMethod: PwaInstallMethod;
}

export interface BrowserInstallGuide {
  browserId: PwaBrowserId;
  title: string;
  introduction: string;
  steps: string[];
  note?: string;
  expectsNativePrompt: boolean;
  showShortcutVsPwaNote: boolean;
}

/** Browsers that may fire beforeinstallprompt (Chromium family). */
export function expectsBeforeInstallPrompt(browser: PwaBrowserInfo): boolean {
  return browser.supportsBeforeInstallPrompt;
}

/** Browsers with a documented manual install path (no native prompt — not an error). */
export function usesManualInstallPath(browser: PwaBrowserInfo): boolean {
  return (
    browser.installMethod === "manual_ios" ||
    browser.installMethod === "manual_firefox" ||
    browser.installMethod === "manual_samsung"
  );
}

export function supportsNativePwaInstall(): boolean {
  if (typeof window === "undefined") return false;
  const browser = detectPwaBrowser();
  if (browser.id === "in_app_browser") return false;
  if (browser.installMethod === "manual_ios") return true;
  return "serviceWorker" in navigator;
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
  | "true_installable"
  | "shortcut_only"
  | "manual_install_path"
  | "browser_unsupported"
  | "prompt_not_yet_fired"
  | "prompt_dismissed_by_user"
  | "sw_not_controlling"
  | "technical_blocker"
  | "in_app_browser";

export type PwaInstallMode =
  | "true_installable"
  | "shortcut_only"
  | "sw_not_controlling"
  | "manifest_or_icons_error"
  | "installed"
  | "prompt_blocked"
  | "manual_install_available"
  | "unsupported";

export interface PwaDebugStatus {
  manifestReachable: boolean;
  manifestLinkHref: string | null;
  manifestLinkCorrect: boolean;
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
  installMode: PwaInstallMode;
  detectedCause: PwaInstallCause | null;
  causeMessage: string | null;
  chromeInstallBlockers: string[];
}

const ADMIN_MANIFEST_PATH = "/admin/manifest.webmanifest";

export function readPageManifestLinkHref(): string | null {
  if (typeof document === "undefined") return null;
  const link = document.querySelector('link[rel="manifest"]');
  return link?.getAttribute("href") ?? null;
}

export function isAdminManifestLinkCorrect(): boolean {
  const href = readPageManifestLinkHref();
  if (!href) return false;
  return href === ADMIN_MANIFEST_PATH || href.endsWith(ADMIN_MANIFEST_PATH);
}

export function auditChromeInstallBlockers(
  probe: PwaProbeResult,
  opts: { canInstall?: boolean } = {},
): string[] {
  const browser = detectPwaBrowser();
  const blockers: string[] = [];

  if (!probe.https) blockers.push("Chrome: Seite muss über HTTPS laufen.");

  const manifestHref = readPageManifestLinkHref();
  if (!manifestHref) {
    blockers.push("Chrome DevTools: Kein <link rel=\"manifest\"> im Dokument.");
  } else if (!isAdminManifestLinkCorrect()) {
    blockers.push(
      `Chrome DevTools: Falsches Manifest verlinkt (${manifestHref}) — erwartet ${ADMIN_MANIFEST_PATH}. Öffentliches Manifest (display: browser) verhindert „App installieren“.`,
    );
  }

  if (!probe.manifestLoaded) {
    blockers.push("Chrome DevTools → Application → Manifest: Manifest nicht erreichbar (kein 200 OK).");
  } else if (!probe.manifestValid) {
    blockers.push(
      "Chrome DevTools → Application → Manifest: Pflichtfelder fehlen (name, start_url, scope, display: standalone, icons).",
    );
  }

  if (!probe.icons192Ok || !probe.icons512Ok) {
    blockers.push("Chrome/Lighthouse: Icons 192×192 und 512×512 müssen mit 200 OK laden.");
  }
  if (!probe.iconsMaskable192Ok || !probe.iconsMaskable512Ok) {
    blockers.push("Chrome/Lighthouse: Maskable Icons 192×192 und 512×512 fehlen oder sind nicht erreichbar.");
  }

  if (expectsBeforeInstallPrompt(browser)) {
    if (!probe.serviceWorkerRegistered) {
      blockers.push("Chrome DevTools → Application → Service Workers: Kein SW für /admin registriert.");
    }
    if (probe.serviceWorkerRegistered && !probe.serviceWorkerActive) {
      blockers.push("Chrome DevTools: Service Worker registriert, aber nicht aktiv.");
    }
    if (probe.serviceWorkerActive && !probe.serviceWorkerControlling) {
      blockers.push(
        "Chrome DevTools: navigator.serviceWorker.controller ist null — Seite einmal neu laden nach SW-Aktivierung.",
      );
    }
  }

  if (
    probe.manifestValid &&
    probe.serviceWorkerControlling &&
    probe.icons192Ok &&
    probe.icons512Ok &&
    probe.iconsMaskable192Ok &&
    probe.iconsMaskable512Ok &&
    isAdminManifestLinkCorrect() &&
    !opts.canInstall &&
    !probe.installPromptAvailable
  ) {
    blockers.push(
      "Alle Lighthouse-PWA-Kriterien erfüllt, aber beforeinstallprompt fehlt — Chrome-Heuristik (Engagement, Prompt zuvor abgelehnt, oder App bereits installiert).",
    );
  }

  return blockers;
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

export function detectPwaBrowser(): PwaBrowserInfo {
  if (typeof navigator === "undefined") {
    return {
      id: "other",
      label: "unbekannt",
      supportsBeforeInstallPrompt: false,
      installMethod: "unknown",
    };
  }

  const ua = navigator.userAgent;

  if (isInAppBrowser()) {
    return {
      id: "in_app_browser",
      label: "In-App-Browser",
      supportsBeforeInstallPrompt: false,
      installMethod: "unknown",
    };
  }

  if (/SamsungBrowser/i.test(ua)) {
    return {
      id: "samsung_internet",
      label: "Samsung Internet",
      supportsBeforeInstallPrompt: true,
      installMethod: "native_prompt",
    };
  }

  if (isIosDevice()) {
    return {
      id: "safari_ios",
      label: "Safari (iOS)",
      supportsBeforeInstallPrompt: false,
      installMethod: "manual_ios",
    };
  }

  if (/android/i.test(ua) && /chrome/i.test(ua) && !/edg/i.test(ua)) {
    return {
      id: "chrome_android",
      label: "Chrome (Android)",
      supportsBeforeInstallPrompt: true,
      installMethod: "native_prompt",
    };
  }

  if (/edg/i.test(ua)) {
    return {
      id: "edge",
      label: "Microsoft Edge",
      supportsBeforeInstallPrompt: true,
      installMethod: "native_prompt",
    };
  }

  if (/firefox/i.test(ua)) {
    return {
      id: "firefox",
      label: "Firefox",
      supportsBeforeInstallPrompt: false,
      installMethod: "manual_firefox",
    };
  }

  if (/chrome/i.test(ua)) {
    return {
      id: "chrome_desktop",
      label: "Chrome (Desktop)",
      supportsBeforeInstallPrompt: true,
      installMethod: "native_prompt",
    };
  }

  return {
    id: "other",
    label: "anderer Browser",
    supportsBeforeInstallPrompt: false,
    installMethod: "unknown",
  };
}

export function detectBrowserProfile(): string {
  return detectPwaBrowser().label;
}

export function getBrowserInstallGuide(browserId: PwaBrowserId): BrowserInstallGuide {
  switch (browserId) {
    case "safari_ios":
      return {
        browserId,
        title: "Installation in Safari (iOS)",
        introduction:
          "Safari unterstützt keinen Install-Dialog (beforeinstallprompt) — das ist normal und kein Fehler. Die Admin-App wird über „Zum Home-Bildschirm“ installiert und startet im Vollbildmodus.",
        steps: [
          "Safari öffnen und den Adminbereich aufrufen",
          "Teilen antippen (Quadrat mit Pfeil nach oben)",
          "Zum Home-Bildschirm wählen",
          "Hinzufügen bestätigen",
          "App vom Home-Bildschirm öffnen (ohne Safari-Leiste)",
        ],
        expectsNativePrompt: false,
        showShortcutVsPwaNote: false,
      };
    case "chrome_android":
      return {
        browserId,
        title: "Installation in Chrome (Android)",
        introduction:
          "Ziel: „App installieren“ im Chrome-Menü oder über den Button unten — echte PWA mit Vollbild und Service Worker.",
        steps: [
          "Chrome-Menü ⋮ oben rechts öffnen",
          "Wenn verfügbar: App installieren wählen (echte PWA)",
          "Alternativ: Button „Admin-App installieren“ im Dashboard nutzen",
          "Wenn nur Zum Startbildschirm hinzufügen erscheint: PWA-Kriterien prüfen und Seite neu laden",
          "Nach Installation: App vom Startbildschirm öffnen (ohne Browserleiste)",
        ],
        note: "„Zum Startbildschirm hinzufügen“ allein ist nur eine Verknüpfung, keine echte PWA.",
        expectsNativePrompt: true,
        showShortcutVsPwaNote: true,
      };
    case "chrome_desktop":
      return {
        browserId,
        title: "Installation in Chrome (Desktop)",
        introduction:
          "Ziel: Install-Icon in der Adressleiste oder „App installieren“ im Chrome-Menü.",
        steps: [
          "Install-Icon in der Adressleiste suchen (Monitor mit Pfeil) — ggf. Puzzle-Symbol prüfen",
          "Oder Chrome-Menü ⋮ → App installieren",
          "Alternativ: Button „Admin-App installieren“ im Dashboard",
          "Nach Installation: App über Startmenü/Dock öffnen (eigenes Fenster)",
        ],
        expectsNativePrompt: true,
        showShortcutVsPwaNote: true,
      };
    case "edge":
      return {
        browserId,
        title: "Installation in Microsoft Edge",
        introduction: "Ziel: „App installieren“ über das Edge-Menü oder den nativen Install-Dialog.",
        steps: [
          "Edge-Menü ⋯ oben rechts öffnen",
          "Apps → Diese Website als App installieren wählen",
          "Oder Install-Icon in der Adressleiste nutzen",
          "Alternativ: Button „Admin-App installieren“ im Dashboard",
          "Nach Installation: App über Startmenü öffnen",
        ],
        expectsNativePrompt: true,
        showShortcutVsPwaNote: true,
      };
    case "firefox":
      return {
        browserId,
        title: "Installation in Firefox",
        introduction:
          "Firefox bietet keinen zuverlässigen beforeinstallprompt-Dialog — das ist browserbedingt, kein PWA-Fehler. Nutze die manuelle Installation.",
        steps: isAndroidDevice()
          ? [
              "Firefox-Menü ☰ öffnen",
              "Installieren oder Zum Startbildschirm hinzufügen wählen (je nach Firefox-Version)",
              "Admin-App vom Startbildschirm öffnen",
            ]
          : [
              "Firefox unterstützt PWA-Installation auf dem Desktop eingeschränkt",
              "Für die beste Erfahrung: Chrome oder Edge nutzen",
              "Oder auf Android Firefox: Menü → Installieren / Zum Startbildschirm hinzufügen",
            ],
        note: "Kein nativer Install-Prompt in Firefox — manuelle Anleitung nutzen.",
        expectsNativePrompt: false,
        showShortcutVsPwaNote: false,
      };
    case "samsung_internet":
      return {
        browserId,
        title: "Installation in Samsung Internet",
        introduction:
          "Samsung Internet unterstützt PWA-Installation ähnlich wie Chrome — per Menü oder nativem Dialog.",
        steps: [
          "Menü ☰ unten rechts öffnen",
          "Seite hinzufügen → Startbildschirm wählen (oder Apps → Installieren, falls angezeigt)",
          "Alternativ: Button „Admin-App installieren“ im Dashboard",
          "App vom Startbildschirm öffnen (Vollbild)",
        ],
        expectsNativePrompt: true,
        showShortcutVsPwaNote: true,
      };
    case "in_app_browser":
      return {
        browserId,
        title: "In-App-Browser",
        introduction:
          "In-App-Browser (z. B. Instagram, Facebook) unterstützen keine PWA-Installation. Bitte in Chrome oder Samsung Internet öffnen.",
        steps: [
          "Menü des In-App-Browsers öffnen",
          "In Chrome öffnen oder Im Browser öffnen wählen",
          "Dort die Installation erneut versuchen",
        ],
        expectsNativePrompt: false,
        showShortcutVsPwaNote: false,
      };
    default:
      return {
        browserId: "other",
        title: "Installation",
        introduction: "Nutze die Installationsoption deines Browsers oder wechsle zu Chrome, Edge oder Safari (iOS).",
        steps: [
          "Browser-Menü öffnen",
          "Nach „App installieren“, „Zum Startbildschirm“ oder ähnlicher Option suchen",
          "Installation bestätigen",
        ],
        expectsNativePrompt: false,
        showShortcutVsPwaNote: false,
      };
  }
}

function pwaShellCriteriaMet(probe: Pick<
  PwaProbeResult,
  "manifestValid" | "icons192Ok" | "icons512Ok" | "iconsMaskable192Ok" | "iconsMaskable512Ok" | "https"
>): boolean {
  return (
    probe.manifestValid &&
    probe.icons192Ok &&
    probe.icons512Ok &&
    probe.iconsMaskable192Ok &&
    probe.iconsMaskable512Ok &&
    probe.https
  );
}

export interface PwaPanelStatus {
  headline: string;
  detail: string | null;
  isError: boolean;
}

export type PwaRealityStatus =
  | "installed"
  | "installable"
  | "blocked_chrome"
  | "technical_error";

export function resolvePwaRealityStatus(opts: {
  canInstall: boolean;
  isInstalled: boolean;
  probe: PwaProbeResult | null;
}): PwaRealityStatus {
  if (opts.isInstalled) return "installed";
  if (opts.canInstall) return "installable";
  if (!opts.probe) return "blocked_chrome";

  if (
    !opts.probe.https ||
    !opts.probe.manifestLoaded ||
    !opts.probe.manifestValid ||
    !opts.probe.icons192Ok ||
    !opts.probe.icons512Ok ||
    !opts.probe.iconsMaskable192Ok ||
    !opts.probe.iconsMaskable512Ok ||
    !isAdminManifestLinkCorrect() ||
    !opts.probe.serviceWorkerRegistered ||
    !opts.probe.serviceWorkerControlling
  ) {
    return "technical_error";
  }

  return "blocked_chrome";
}

export function getPwaRealityHeadline(status: PwaRealityStatus): string {
  switch (status) {
    case "installed":
      return "Bereits installiert (standalone)";
    case "installable":
      return "Echte PWA-Installation verfügbar";
    case "blocked_chrome":
      return "BLOCKED BY CHROME / MANUAL VERIFICATION NEEDED";
    case "technical_error":
      return "Technischer PWA-Fehler — Installation blockiert";
    default:
      return "PWA-Status unbekannt";
  }
}

export function getPwaPanelStatus(opts: {
  canInstall: boolean;
  installMode: PwaInstallMode | undefined;
  browser: PwaBrowserInfo;
  causeMessage: string | null;
}): PwaPanelStatus {
  const { canInstall, installMode, browser, causeMessage } = opts;

  if (canInstall) {
    const headline =
      browser.id === "edge"
        ? "App installieren verfügbar (Edge)"
        : browser.id === "chrome_desktop"
          ? "App installieren verfügbar (Chrome Desktop)"
          : browser.id === "samsung_internet"
            ? "App installieren verfügbar (Samsung Internet)"
            : "Echte PWA-Installation verfügbar („App installieren“)";
    return {
      headline,
      detail: causeMessage ?? "Nativer Install-Dialog ist bereit.",
      isError: false,
    };
  }

  if (!installMode && browser.id === "safari_ios") {
    return {
      headline: "Installation über Safari möglich",
      detail:
        "Safari hat keinen Install-Dialog — Teilen → Zum Home-Bildschirm. Das ist der vorgesehene Weg, kein Fehler.",
      isError: false,
    };
  }

  if (!installMode && browser.id === "firefox") {
    return {
      headline: "Manuelle Installation in Firefox",
      detail: "Firefox hat keinen zuverlässigen Install-Dialog — siehe Installationshilfe.",
      isError: false,
    };
  }

  if (installMode === "manual_install_available") {
    if (browser.id === "safari_ios") {
      return {
        headline: "Installation über Safari möglich",
        detail:
          causeMessage ??
          "Safari hat keinen Install-Dialog — Teilen → Zum Home-Bildschirm. Das ist der vorgesehene Weg, kein Fehler.",
        isError: false,
      };
    }
    if (browser.id === "firefox") {
      return {
        headline: "Manuelle Installation in Firefox",
        detail:
          causeMessage ??
          "Firefox hat keinen zuverlässigen Install-Dialog — siehe browser-spezifische Anleitung.",
        isError: false,
      };
    }
    if (browser.id === "samsung_internet") {
      return {
        headline: "Manuelle Installation in Samsung Internet",
        detail: causeMessage ?? "Nutze das Samsung-Internet-Menü — siehe Installationshilfe.",
        isError: false,
      };
    }
  }

  if (installMode === "manifest_or_icons_error" || installMode === "sw_not_controlling") {
    return {
      headline: installMode === "sw_not_controlling" ? "Service Worker übernimmt noch" : "Technischer PWA-Fehler",
      detail: causeMessage,
      isError: true,
    };
  }

  if (installMode === "shortcut_only" && expectsBeforeInstallPrompt(browser)) {
    return {
      headline: "Nur Startbildschirm-Verknüpfung — keine echte PWA",
      detail:
        causeMessage ??
        `${browser.label} erkennt die Admin-App aktuell nur als Verknüpfung, nicht als installierbare PWA.`,
      isError: true,
    };
  }

  if (browser.id === "in_app_browser") {
    return {
      headline: "In-App-Browser — Installation nicht möglich",
      detail: causeMessage ?? "Bitte in Chrome oder Samsung Internet öffnen.",
      isError: true,
    };
  }

  if (expectsBeforeInstallPrompt(browser)) {
    return {
      headline: "BLOCKED BY CHROME / MANUAL VERIFICATION NEEDED",
      detail:
        causeMessage ??
        `${browser.label}: Technische Kriterien können erfüllt sein, aber kein Install-Prompt. Chrome DevTools prüfen oder PWA-Status zurücksetzen.`,
      isError: true,
    };
  }

  return {
    headline: "Installationshilfe verfügbar",
    detail: causeMessage ?? `Siehe Anleitung für ${browser.label}.`,
    isError: false,
  };
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
    sessionStorage.removeItem("pb-admin-pwa-sw-reload-done");
  }
  clearDeferredPrompt();
  if (typeof window !== "undefined") {
    window.__pbPwaPromptFired = false;
    window.__pbPwaInstalledFired = false;
  }
}

export async function resetPwaInstallCaches(): Promise<void> {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((reg) => reg.unregister()));
  }
  if (typeof caches === "undefined") return;
  const keys = await caches.keys();
  await Promise.all(keys.filter((key) => key.startsWith("pb-admin")).map((key) => caches.delete(key)));
}

export function resolvePwaInstallMode(
  probe: PwaProbeResult,
  opts: { canInstall?: boolean; promptDismissedRecently?: boolean } = {},
): PwaInstallMode {
  const browser = detectPwaBrowser();

  if (probe.state === "installed" || isStandalonePwa()) return "installed";
  if (opts.canInstall || probe.installPromptAvailable) return "true_installable";

  if (browser.id === "in_app_browser") return "unsupported";

  if (!probe.manifestValid || !probe.icons192Ok || !probe.icons512Ok || !probe.iconsMaskable192Ok || !probe.iconsMaskable512Ok) {
    return "manifest_or_icons_error";
  }

  if (browser.installMethod === "manual_ios" && pwaShellCriteriaMet(probe)) {
    return "manual_install_available";
  }

  if (browser.id === "firefox" && pwaShellCriteriaMet(probe)) {
    return "manual_install_available";
  }

  if (!("serviceWorker" in navigator) && browser.installMethod !== "manual_ios") {
    return "unsupported";
  }

  if (probe.serviceWorkerActive && !probe.serviceWorkerControlling && expectsBeforeInstallPrompt(browser)) {
    return "sw_not_controlling";
  }

  if (opts.promptDismissedRecently && expectsBeforeInstallPrompt(browser)) return "prompt_blocked";

  if (
    probe.manifestValid &&
    probe.serviceWorkerRegistered &&
    !probe.serviceWorkerControlling &&
    expectsBeforeInstallPrompt(browser)
  ) {
    return "sw_not_controlling";
  }

  if (
    browser.id === "samsung_internet" &&
    pwaShellCriteriaMet(probe) &&
    !probe.installPromptAvailable &&
    probe.serviceWorkerControlling
  ) {
    return "manual_install_available";
  }

  if (
    expectsBeforeInstallPrompt(browser) &&
    pwaShellCriteriaMet(probe) &&
    probe.serviceWorkerControlling &&
    !probe.installPromptAvailable
  ) {
    return "shortcut_only";
  }

  if (usesManualInstallPath(browser) && pwaShellCriteriaMet(probe)) {
    return "manual_install_available";
  }

  return expectsBeforeInstallPrompt(browser) ? "shortcut_only" : "unsupported";
}

export function detectPwaInstallCause(
  probe: PwaProbeResult,
  opts: { promptDismissedRecently?: boolean; canInstall?: boolean } = {},
): { cause: PwaInstallCause | null; message: string | null } {
  const mode = resolvePwaInstallMode(probe, opts);
  const browser = detectPwaBrowser();

  if (mode === "installed") {
    return {
      cause: "already_standalone",
      message: "Die Admin-App läuft bereits im Vollbildmodus (standalone).",
    };
  }
  if (mode === "true_installable") {
    const promptLabel =
      browser.id === "edge"
        ? "Edge bietet „App installieren“ an."
        : browser.id === "chrome_desktop"
          ? "Chrome bietet „App installieren“ oder das Install-Icon in der Adressleiste an."
          : browser.id === "samsung_internet"
            ? "Samsung Internet bietet eine PWA-Installation an."
            : "Chrome bietet eine echte PWA-Installation an („App installieren“).";
    return { cause: "true_installable", message: promptLabel };
  }
  if (mode === "manual_install_available") {
    if (browser.id === "safari_ios") {
      return {
        cause: "manual_install_path",
        message:
          "Safari hat keinen Install-Dialog — Installation über Teilen → Zum Home-Bildschirm. Das ist normal, kein Fehler.",
      };
    }
    if (browser.id === "firefox") {
      return {
        cause: "manual_install_path",
        message:
          "Firefox hat keinen zuverlässigen Install-Dialog — nutze die Firefox-Anleitung in der Installationshilfe.",
      };
    }
    if (browser.id === "samsung_internet") {
      return {
        cause: "manual_install_path",
        message:
          "Samsung Internet: Installation über Menü → Seite hinzufügen → Startbildschirm (oder nativer Dialog, wenn verfügbar).",
      };
    }
    return {
      cause: "manual_install_path",
      message: `Installation über ${browser.label} — siehe browser-spezifische Anleitung.`,
    };
  }
  if (isInAppBrowser()) {
    return {
      cause: "in_app_browser",
      message:
        "In-App-Browser erkannt — bitte die Seite in Chrome öffnen (Menü → „In Chrome öffnen“).",
    };
  }
  if (mode === "unsupported") {
    return {
      cause: "browser_unsupported",
      message: `${browser.label} unterstützt diese PWA-Installation nicht zuverlässig — bitte Chrome, Edge oder Safari (iOS) nutzen.`,
    };
  }
  if (mode === "manifest_or_icons_error") {
    return {
      cause: "technical_blocker",
      message: "Manifest oder Icons sind fehlerhaft — siehe technische Diagnose.",
    };
  }
  if (mode === "sw_not_controlling") {
    return {
      cause: "sw_not_controlling",
      message:
        "Der Service Worker kontrolliert /admin noch nicht — Seite einmal neu laden und erneut prüfen.",
    };
  }
  if (mode === "prompt_blocked") {
    return {
      cause: "prompt_dismissed_by_user",
      message: `Der Installationsdialog wurde zuvor abgelehnt — ${browser.label} blockiert den Prompt ggf. temporär.`,
    };
  }
  if (mode === "shortcut_only") {
    return {
      cause: "shortcut_only",
      message: `${browser.label} erkennt die Admin-App aktuell nur als Verknüpfung („Zum Startbildschirm hinzufügen“), nicht als installierbare PWA. PWA-Kriterien sind noch nicht vollständig erfüllt oder der Browser liefert keinen Install-Prompt.`,
    };
  }
  if (!probe.installPromptAvailable && !readPromptFiredFlag() && expectsBeforeInstallPrompt(browser)) {
    return {
      cause: "prompt_not_yet_fired",
      message: `${browser.label} bietet aktuell keinen Installationsdialog an — Seite neu laden oder Installationshilfe öffnen.`,
    };
  }
  return { cause: null, message: null };
}

export async function buildPwaDebugStatus(
  probe: PwaProbeResult,
  opts: { promptDismissedRecently?: boolean; canInstall?: boolean } = {},
): Promise<PwaDebugStatus> {
  const detected = detectPwaInstallCause(probe, opts);
  const chromeInstallBlockers = auditChromeInstallBlockers(probe, opts);
  return {
    manifestReachable: probe.manifestLoaded && probe.manifestValid,
    manifestLinkHref: readPageManifestLinkHref(),
    manifestLinkCorrect: isAdminManifestLinkCorrect(),
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
    installMode: probe.installMode,
    detectedCause: detected.cause,
    causeMessage: detected.message,
    chromeInstallBlockers,
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

export function explainPwaBlockers(result: PwaProbeResult, browser: PwaBrowserInfo = detectPwaBrowser()): string[] {
  const messages: string[] = [];
  if (!isAdminManifestLinkCorrect()) {
    const href = readPageManifestLinkHref();
    messages.push(
      `Falsches Manifest im HTML (${href ?? "fehlt"}) — Chrome lädt ${ADMIN_MANIFEST_PATH}, nicht /manifest.webmanifest.`,
    );
  }
  if (!result.https) messages.push("Die Seite muss über HTTPS erreichbar sein.");
  if (!result.manifestLoaded) messages.push("Das Web-App-Manifest konnte nicht geladen werden.");
  if (result.manifestLoaded && !result.manifestValid) {
    messages.push("Das Manifest ist unvollständig (start_url, scope oder display).");
  }
  if (!result.icons192Ok || !result.icons512Ok) {
    messages.push("Die App-Icons (192×192 / 512×512) sind nicht erreichbar.");
  }
  if (!result.iconsMaskable192Ok || !result.iconsMaskable512Ok) {
    messages.push("Maskable Icons (192×192 / 512×512) fehlen oder sind nicht erreichbar.");
  }
  if (result.icons192Ok && !result.icons192MimeOk) {
    messages.push("Das 192×192-Icon hat keinen gültigen PNG-MIME-Type.");
  }
  if (result.icons512Ok && !result.icons512MimeOk) {
    messages.push("Das 512×512-Icon hat keinen gültigen PNG-MIME-Type.");
  }

  const needsServiceWorker = expectsBeforeInstallPrompt(browser) || browser.id === "firefox";

  if (needsServiceWorker && !result.serviceWorkerRegistered) {
    messages.push("Kein Service Worker für /admin registriert.");
  }
  if (needsServiceWorker && result.serviceWorkerRegistered && !result.serviceWorkerActive) {
    messages.push("Der Service Worker ist registriert, aber noch nicht aktiv.");
  }
  if (needsServiceWorker && result.serviceWorkerActive && !result.serviceWorkerControlling) {
    messages.push(
      `Der Service Worker kontrolliert diese Seite noch nicht — ${browser.label} feuert beforeinstallprompt oft erst nach einem Seiten-Reload.`,
    );
  }

  if (
    expectsBeforeInstallPrompt(browser) &&
    result.manifestValid &&
    result.serviceWorkerActive &&
    result.serviceWorkerControlling &&
    result.icons192Ok &&
    result.icons512Ok &&
    !result.installPromptAvailable
  ) {
    messages.push(
      `Alle technischen Kriterien sind erfüllt, aber ${browser.label} meldet keinen Install-Prompt. Mögliche Ursachen: App bereits installiert, Prompt zuvor abgelehnt, In-App-Browser, oder Browser-Engagement-Heuristik.`,
    );
  }

  return messages;
}

function buildStatusLabel(
  state: PwaInstallabilityState,
  issues: string[],
  installMode: PwaInstallMode,
): string {
  switch (state) {
    case "installed":
      return "Bereits installiert";
    case "installable":
      return "Installierbar";
    case "browser_unsupported":
      return "Browser nicht unterstützt";
    case "not_installable":
      if (installMode === "manual_install_available") return "Manuelle Installation möglich";
      if (issues.includes("sw_not_controlling")) return "Service Worker kontrolliert /admin nicht";
      if (issues.includes("prompt_pending")) return "Install-Dialog noch ausstehend";
      if (issues.includes("shortcut_only")) return "Nur Startbildschirm-Verknüpfung möglich";
      if (issues.includes("wrong_manifest_link")) return "Falsches Manifest verlinkt";
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
  const browser = detectPwaBrowser();
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
        id?: string;
        name?: string;
        short_name?: string;
        start_url?: string;
        scope?: string;
        display?: string;
        icons?: { sizes?: string; purpose?: string }[];
      };
      const startUrl = String(manifest.start_url ?? "");
      const scope = String(manifest.scope ?? "");
      const has192 = manifest.icons?.some((i) => i.sizes?.includes("192"));
      const has512 = manifest.icons?.some((i) => i.sizes?.includes("512"));
      const hasMaskable = manifest.icons?.some((i) => i.purpose === "maskable");
      manifestValid = Boolean(
        manifest.name &&
          manifest.short_name &&
          (startUrl.includes("/admin") || startUrl.endsWith("/admin")) &&
          (scope.includes("/admin") || scope.endsWith("/admin")) &&
          (manifest.display === "standalone" || manifest.display === "fullscreen") &&
          has192 &&
          has512 &&
          hasMaskable &&
          manifest.id,
      );
      if (!manifestValid) issues.push("manifest_invalid");
    }
  } catch {
    manifestLoaded = false;
    issues.push("manifest_missing");
  }

  const icon192 = await checkIconUrl(`${BRAND.assets.icon192}?v=${BRAND.iconVersion}`);
  const icon512 = await checkIconUrl(`${BRAND.assets.icon512}?v=${BRAND.iconVersion}`);
  const iconMaskable192 = await checkIconUrl(`${BRAND.assets.iconMaskable192}?v=${BRAND.iconVersion}`);
  const iconMaskable512 = await checkIconUrl(`${BRAND.assets.iconMaskable512}?v=${BRAND.iconVersion}`);
  const icons192Ok = icon192.ok;
  const icons512Ok = icon512.ok;
  const icons192MimeOk = icon192.mimeOk;
  const icons512MimeOk = icon512.mimeOk;
  const iconsMaskable192Ok = iconMaskable192.ok;
  const iconsMaskable512Ok = iconMaskable512.ok;
  if (!icons192Ok || !icons512Ok) issues.push("icons_missing");
  if (!iconsMaskable192Ok || !iconsMaskable512Ok) issues.push("maskable_icons_missing");
  if (icons192Ok && !icons192MimeOk) issues.push("icon192_mime");
  if (icons512Ok && !icons512MimeOk) issues.push("icon512_mime");

  let serviceWorkerRegistered = false;
  let serviceWorkerActive = false;
  let serviceWorkerControlling = false;
  let offlineCapable = false;

  const needsServiceWorker = expectsBeforeInstallPrompt(browser) || browser.id === "firefox";

  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/admin");
      serviceWorkerRegistered = Boolean(reg);
      serviceWorkerActive = Boolean(reg?.active);
      serviceWorkerControlling = Boolean(navigator.serviceWorker.controller);
      offlineCapable = serviceWorkerActive;
      if (needsServiceWorker && !serviceWorkerRegistered) issues.push("service_worker_missing");
      else if (needsServiceWorker && !serviceWorkerActive) issues.push("service_worker_inactive");
      if (needsServiceWorker && serviceWorkerActive && !serviceWorkerControlling) {
        issues.push("sw_not_controlling");
      }
      if (needsServiceWorker && !offlineCapable) issues.push("offline_missing");
    } catch {
      if (needsServiceWorker) issues.push("service_worker_missing");
    }
  } else if (needsServiceWorker && browser.installMethod !== "manual_ios") {
    issues.push("browser_unsupported");
  }

  const standalone = resolvePwaInstalled();
  const installPromptAvailable = Boolean(deferred);

  if (
    expectsBeforeInstallPrompt(browser) &&
    !standalone &&
    manifestValid &&
    serviceWorkerActive &&
    serviceWorkerControlling &&
    icons192Ok &&
    icons512Ok &&
    iconsMaskable192Ok &&
    iconsMaskable512Ok &&
    https &&
    !installPromptAvailable
  ) {
    issues.push("prompt_pending");
    issues.push("shortcut_only");
  }

  let state: PwaInstallabilityState;
  if (standalone) {
    state = "installed";
  } else if (browser.id === "in_app_browser") {
    state = "browser_unsupported";
  } else if (!("serviceWorker" in navigator) && browser.installMethod !== "manual_ios") {
    state = "browser_unsupported";
  } else if (
    installPromptAvailable &&
    manifestValid &&
    serviceWorkerActive &&
    icons192Ok &&
    icons512Ok &&
    iconsMaskable192Ok &&
    iconsMaskable512Ok
  ) {
    state = "installable";
  } else if (
    browser.installMethod === "manual_ios" &&
    manifestValid &&
    icons192Ok &&
    icons512Ok &&
    iconsMaskable192Ok &&
    iconsMaskable512Ok &&
    https
  ) {
    state = "not_installable";
  } else {
    state = "not_installable";
  }

  const installMode = resolvePwaInstallMode(
    {
      state,
      manifestLoaded,
      manifestValid,
      icons192Ok,
      icons512Ok,
      icons192MimeOk,
      icons512MimeOk,
      iconsMaskable192Ok,
      iconsMaskable512Ok,
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
      installMode: "shortcut_only",
    },
    { canInstall: installPromptAvailable },
  );

  if (!isAdminManifestLinkCorrect()) {
    issues.push("wrong_manifest_link");
  }

  const blockers = explainPwaBlockers(
    {
      state,
      manifestLoaded,
      manifestValid,
      icons192Ok,
      icons512Ok,
      icons192MimeOk,
      icons512MimeOk,
      iconsMaskable192Ok,
      iconsMaskable512Ok,
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
      installMode,
    },
    browser,
  );

  return {
    state,
    manifestLoaded,
    manifestValid,
    icons192Ok,
    icons512Ok,
    icons192MimeOk,
    icons512MimeOk,
    iconsMaskable192Ok,
    iconsMaskable512Ok,
    serviceWorkerRegistered,
    serviceWorkerActive,
    serviceWorkerControlling,
    offlineCapable,
    installPromptAvailable,
    https,
    issues,
    blockers,
    statusLabel: buildStatusLabel(state, issues, installMode),
    checkedAt: new Date().toISOString(),
    installMode,
  };
}

const ADMIN_SW_PATH = "/admin/sw.js";

export async function registerAdminServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;

  let reg: ServiceWorkerRegistration | null = null;
  try {
    reg = await navigator.serviceWorker.register(ADMIN_SW_PATH, { scope: "/admin/" });
  } catch (err) {
    console.warn("[pwa] registration failed for", ADMIN_SW_PATH, err);
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
