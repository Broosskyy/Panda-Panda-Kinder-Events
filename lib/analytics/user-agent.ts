export interface ParsedUserAgent {
  browser: string;
  os: string;
}

export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) return { browser: "Unbekannt", os: "Unbekannt" };

  const ua = userAgent;

  let browser = "Unbekannt";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) browser = "Chrome";
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/opr\//i.test(ua) || /opera/i.test(ua)) browser = "Opera";

  let os = "Unbekannt";
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os };
}
