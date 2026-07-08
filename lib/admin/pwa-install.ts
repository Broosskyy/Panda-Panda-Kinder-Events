export const PWA_HIDE_STORAGE_KEY = "pb-admin-pwa-install-hidden";
/** @deprecated Use PWA_HIDE_STORAGE_KEY — kept for migration */
export const PWA_DISMISS_STORAGE_KEY = "pb-admin-pwa-install-dismissed";
export const PWA_INSTALLED_STORAGE_KEY = "pb-admin-pwa-installed";
export const PWA_SESSION_CLOSED_KEY = "pb-admin-pwa-card-closed";

export type PwaInstallOutcome = "accepted" | "dismissed" | "unavailable";

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
  return !isIosDevice();
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
  const captured = window.__pbPwaDeferredPrompt ?? null;
  return captured;
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
