/** Client IP from reverse-proxy headers (Vercel, Cloudflare, etc.). */
export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? null;
}

export function getRequestUserAgent(request: Request): string | null {
  return request.headers.get("user-agent");
}

export function getRequestAuditMeta(request: Request): { ipAddress: string | null; userAgent: string | null } {
  return {
    ipAddress: getClientIp(request),
    userAgent: getRequestUserAgent(request),
  };
}
