export const PWA_DISMISS_STORAGE_KEY = "pb-admin-pwa-install-dismissed";
export const PWA_INSTALLED_STORAGE_KEY = "pb-admin-pwa-installed";

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

export function readPwaDismissed(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(PWA_DISMISS_STORAGE_KEY) === "1";
}

export function markPwaDismissed(): void {
  localStorage.setItem(PWA_DISMISS_STORAGE_KEY, "1");
}

export function markPwaInstalled(): void {
  localStorage.setItem(PWA_INSTALLED_STORAGE_KEY, "1");
  localStorage.removeItem(PWA_DISMISS_STORAGE_KEY);
}

export function readPwaInstalledFlag(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(PWA_INSTALLED_STORAGE_KEY) === "1";
}
