import { NextResponse } from "next/server";
import { inquiryApiSchema } from "@/lib/validation";
import { eventTypes } from "@/lib/faqs";
import { sendInquiryNotification, isResendConfigured } from "@/lib/email";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { stripHtml, validateSpamGuard } from "@/lib/spam-guard";
import { safeApiError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`inquiry:${ip}`, 5, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }

    const body = await request.json();
    const parsed = inquiryApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Ungültige Formulardaten." }, { status: 400 });
    }

    const spamError = validateSpamGuard({
      website: parsed.data.website,
      _formLoadedAt: parsed.data._formLoadedAt,
    });
    if (spamError) {
      return NextResponse.json({ error: spamError }, { status: 400 });
    }

    const childrenRaw = parsed.data.childrenCount?.trim();
    let childrenCount = 1;
    if (childrenRaw) {
      const parsedCount = Number.parseInt(childrenRaw, 10);
      if (Number.isNaN(parsedCount) || parsedCount < 1 || parsedCount > 200) {
        return NextResponse.json({ error: "Ungültige Kinderanzahl." }, { status: 400 });
      }
      childrenCount = parsedCount;
    }

    if (!eventTypes.includes(parsed.data.eventType)) {
      return NextResponse.json({ error: "Ungültige Veranstaltungsart." }, { status: 400 });
    }

    const data = {
      name: stripHtml(parsed.data.name),
      phone: stripHtml(parsed.data.phone),
      email: stripHtml(parsed.data.email).toLowerCase(),
      eventType: parsed.data.eventType,
      date: parsed.data.date,
      time: "12:00",
      duration: undefined as string | undefined,
      location: "Wird im Gespräch geklärt",
      childrenCount: String(childrenCount),
      message: stripHtml(parsed.data.message),
    };

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { error: dbError } = await supabase.from("booking_requests").insert({
        name: data.name,
        phone: data.phone,
        email: data.email,
        event_type: data.eventType,
        event_date: data.date,
        event_time: data.time,
        duration: null,
        location: data.location,
        children_count: childrenCount,
        message: data.message,
        status: "new",
      });

      if (dbError) {
        safeApiError("Supabase inquiry insert:", dbError, "");
        return NextResponse.json(
          { error: "Anfrage konnte nicht gespeichert werden. Bitte später erneut versuchen." },
          { status: 500 },
        );
      }
    }

    if (isResendConfigured()) {
      try {
        await sendInquiryNotification({
          name: data.name,
          phone: data.phone,
          email: data.email,
          eventType: data.eventType,
          date: data.date,
          time: data.time,
          location: data.location,
          childrenCount: data.childrenCount,
          message: data.message,
        });
      } catch (emailError) {
        safeApiError("Resend inquiry:", emailError, "");
        if (!isSupabaseConfigured()) {
          return NextResponse.json(
            { error: "E-Mail konnte nicht gesendet werden. Bitte kontaktiert uns direkt." },
            { status: 500 },
          );
        }
      }
    } else if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Formular ist derzeit nicht verfügbar. Bitte kontaktiert uns direkt." },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    safeApiError("Inquiry API:", error, "");
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
