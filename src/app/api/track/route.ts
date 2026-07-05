import { NextResponse } from "next/server";
import { z } from "zod";
import { detectDeviceType, sanitizePath, sanitizeReferrer, sanitizeUserAgent } from "@/lib/analytics/device";
import { isBotUserAgent } from "@/lib/analytics/bot";
import { parseUserAgent } from "@/lib/analytics/user-agent";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { safeApiError } from "@/lib/api-error";

export const dynamic = "force-dynamic";

const trackSchema = z.object({
  path: z.string().min(1).max(300),
  referrer: z.string().max(500).nullable().optional(),
  sessionId: z.string().min(8).max(64).regex(/^[a-zA-Z0-9-]+$/),
});

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }

    const ip = getClientIp(request);
    const limited = rateLimit(`track:${ip}`, 120, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const body = await request.json();
    const parsed = trackSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Tracking-Daten." }, { status: 400 });
    }

    const path = sanitizePath(parsed.data.path);
    if (!path) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const userAgent = request.headers.get("user-agent");
    if (isBotUserAgent(userAgent)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const deviceType = detectDeviceType(userAgent);
    const { browser, os } = parseUserAgent(userAgent);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("page_views").insert({
      path,
      referrer: sanitizeReferrer(parsed.data.referrer ?? null),
      user_agent: sanitizeUserAgent(userAgent),
      device_type: deviceType,
      browser,
      os,
      session_id: parsed.data.sessionId,
    });

    if (error) {
      safeApiError("page_views insert:", error, "");
      return NextResponse.json({ error: "Tracking fehlgeschlagen." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    safeApiError("track API:", err, "");
    return NextResponse.json({ error: "Tracking fehlgeschlagen." }, { status: 500 });
  }
}
