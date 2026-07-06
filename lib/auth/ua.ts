export function parseUserAgent(ua: string | null): {
  browser: string;
  os: string;
  device: string;
} {
  const raw = ua ?? "Unbekannt";
  const lower = raw.toLowerCase();

  let os = "Unbekannt";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os") || lower.includes("macintosh")) os = "macOS";
  else if (lower.includes("iphone") || lower.includes("ipad")) os = "iOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("linux")) os = "Linux";

  let browser = "Unbekannt";
  if (lower.includes("edg/")) browser = "Edge";
  else if (lower.includes("chrome/") && !lower.includes("edg/")) browser = "Chrome";
  else if (lower.includes("firefox/")) browser = "Firefox";
  else if (lower.includes("safari/") && !lower.includes("chrome/")) browser = "Safari";

  let device = "Desktop";
  if (lower.includes("mobile") || lower.includes("iphone") || lower.includes("android")) {
    device = "Mobil";
  } else if (lower.includes("ipad") || lower.includes("tablet")) {
    device = "Tablet";
  }

  return { browser, os, device };
}
