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

    const submittedAt = new Date();
    const data = {
      name: stripHtml(parsed.data.name),
      phone: stripHtml(parsed.data.phone),
      email: stripHtml(parsed.data.email).toLowerCase(),
      eventType: parsed.data.eventType,
      date: parsed.data.date,
      childrenCount: String(childrenCount),
      message: stripHtml(parsed.data.message),
      submittedAt: submittedAt.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    let savedToDb = false;

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { error: dbError } = await supabase.from("booking_requests").insert({
        name: data.name,
        phone: data.phone,
        email: data.email,
        event_type: data.eventType,
        event_date: data.date,
        event_time: "10:00:00",
        duration: null,
        location: "Wird im Gespräch geklärt",
        children_count: childrenCount,
        message: data.message,
        status: "new",
        admin_notes: "Quelle: Website Kontaktformular",
      });

      if (dbError) {
        safeApiError("Supabase inquiry insert:", dbError, "");
        return NextResponse.json(
          { error: "Anfrage konnte nicht gespeichert werden. Bitte später erneut versuchen." },
          { status: 500 },
        );
      }
      savedToDb = true;

      try {
        const { notifyAdminsNewInquiry } = await import("@/lib/admin/push/send");
        await notifyAdminsNewInquiry();
      } catch (pushError) {
        safeApiError("inquiry_push_send_failed:", pushError, "");
      }
    }

    if (!isResendConfigured()) {
      if (!savedToDb) {
        return NextResponse.json(
          { error: "Formular ist derzeit nicht verfügbar. Bitte kontaktiert uns direkt." },
          { status: 503 },
        );
      }
      return NextResponse.json({
        success: true,
        warning: "Anfrage gespeichert. E-Mail-Versand ist nicht konfiguriert.",
      });
    }

    try {
      const emailResult = await sendInquiryNotification(data);

      if (!emailResult.adminSent) {
        safeApiError("Inquiry admin email failed:", emailResult.errors.join("; "), "");
        if (!savedToDb) {
          return NextResponse.json(
            { error: "E-Mail konnte nicht gesendet werden. Bitte kontaktiert uns direkt." },
            { status: 500 },
          );
        }
        return NextResponse.json({
          success: true,
          warning: "Anfrage gespeichert. Die Benachrichtigung konnte nicht versendet werden — bitte im Admin prüfen.",
        });
      }

      if (!emailResult.customerSent && emailResult.errors.length > 0) {
        safeApiError("Inquiry customer email failed:", emailResult.errors.join("; "), "");
      }

      return NextResponse.json({ success: true });
    } catch (emailError) {
      safeApiError("Resend inquiry:", emailError, "");
      if (!savedToDb) {
        return NextResponse.json(
          { error: "E-Mail konnte nicht gesendet werden. Bitte kontaktiert uns direkt." },
          { status: 500 },
        );
      }
      return NextResponse.json({
        success: true,
        warning: "Anfrage gespeichert. E-Mail-Versand teilweise fehlgeschlagen — bitte im Admin prüfen.",
      });
    }
  } catch (error) {
    safeApiError("Inquiry API:", error, "");
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}
