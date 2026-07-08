import { parseUserAgent } from "@/lib/auth/ua";

export interface RequestClientContext {
  ipMasked: string;
  userAgent: string | null;
  deviceLabel: string;
  osLabel: string;
  browserLabel: string;
  countryCode: string | null;
  region: string | null;
  city: string | null;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Masks last IPv4 octet / IPv6 tail for privacy-friendly storage. */
export function maskIp(ip: string): string {
  const trimmed = ip.trim();
  if (!trimmed || trimmed === "unknown") return "unknown";
  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length <= 2) return `${parts[0]}:…`;
    return `${parts.slice(0, 3).join(":")}:…`;
  }
  const octets = trimmed.split(".");
  if (octets.length === 4) return `${octets[0]}.${octets[1]}.${octets[2]}.xxx`;
  return trimmed;
}

function readGeo(request: Request): Pick<RequestClientContext, "countryCode" | "region" | "city"> {
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    request.headers.get("x-country-code");
  const region =
    request.headers.get("x-vercel-ip-country-region") ?? request.headers.get("x-region-code");
  const city = request.headers.get("x-vercel-ip-city") ?? request.headers.get("x-city");

  return {
    countryCode: country?.trim().toUpperCase() || null,
    region: region?.trim() || null,
    city: city?.trim() || null,
  };
}

export function getRequestClientContext(request: Request): RequestClientContext {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent");
  const ua = parseUserAgent(userAgent);
  const geo = readGeo(request);

  return {
    ipMasked: maskIp(ip),
    userAgent,
    deviceLabel: ua.device,
    osLabel: ua.os,
    browserLabel: ua.browser,
    ...geo,
  };
}
