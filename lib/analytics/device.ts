import type { DeviceType } from "./types";

export function detectDeviceType(userAgent: string | null): DeviceType {
  if (!userAgent) return "unknown";
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobile))/.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android.*mobile|windows phone|blackberry/.test(ua)) return "mobile";
  if (/windows|macintosh|linux|cros/.test(ua)) return "desktop";
  return "unknown";
}

/** Truncate user agent for storage — no IP, minimal fingerprinting. */
export function sanitizeUserAgent(userAgent: string | null): string | null {
  if (!userAgent) return null;
  return userAgent.slice(0, 120);
}

export function sanitizeReferrer(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    const url = new URL(referrer);
    return url.pathname.slice(0, 200) || null;
  } catch {
    return null;
  }
}

export function sanitizePath(path: string): string | null {
  if (!path || !path.startsWith("/")) return null;
  if (path.startsWith("/admin") || path.startsWith("/api")) return null;
  return path.split("?")[0].slice(0, 300);
}
