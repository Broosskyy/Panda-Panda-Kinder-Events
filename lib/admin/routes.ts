/**
 * Canonical admin URLs — single source of truth.
 * Trailing slash on ADMIN_HOME_PATH is required for Service Worker scope matching.
 */
export const ADMIN_HOME_PATH = "/admin/" as const;
export const ADMIN_SW_SCOPE = "/admin/" as const;
export const ADMIN_SW_SCRIPT_PATH = "/admin/sw.js" as const;
export const ADMIN_MANIFEST_PATH = "/admin/manifest.webmanifest" as const;
export const ADMIN_PWA_CAPTURE_PATH = "/admin/pwa-capture.js" as const;

/** Paths reachable without admin session (login, invite, password reset). */
export const ADMIN_PUBLIC_PAGE_PREFIXES = [
  "/admin/passwort-reset",
  "/admin/einladung",
] as const;

export function isAdminHomePath(pathname: string): boolean {
  return pathname === ADMIN_HOME_PATH;
}

export function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}
