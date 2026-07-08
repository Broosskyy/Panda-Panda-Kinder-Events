import { NextResponse } from "next/server";
import { mapReviewRow } from "@/lib/cms/reviews";
import { uploadImage } from "@/lib/cms/storage";
import { toStoragePath } from "@/lib/cms/storage-ref";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import { reviewSchema } from "@/lib/validation";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { stripHtml, validateSpamGuard } from "@/lib/spam-guard";
import { safeApiError } from "@/lib/api-error";
import { isResendConfigured } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Bewertungen sind derzeit nicht verfügbar. Bitte später erneut versuchen." },
        { status: 503 },
      );
    }

    const ip = getClientIp(request);
    const limited = rateLimit(`reviews:${ip}`, 3, 60 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Zu viele Bewertungen. Bitte später erneut versuchen." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let name: string;
    let eventType: string;
    let rating: number;
    let text: string;
    let profileImage: File | null = null;
    let eventImage: File | null = null;
    let website: string | undefined;
    let formLoadedAt: number | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const parsed = reviewSchema.safeParse({
        name: formData.get("name"),
        eventType: formData.get("eventType"),
        rating: formData.get("rating"),
        text: formData.get("text"),
        website: formData.get("website") ?? "",
        _formLoadedAt: formData.get("_formLoadedAt")
          ? Number(formData.get("_formLoadedAt"))
          : undefined,
      });

      if (!parsed.success) {
        return NextResponse.json({ error: "Ungültige Bewertungsdaten." }, { status: 400 });
      }

      ({ name, eventType, rating, text, website, _formLoadedAt: formLoadedAt } = parsed.data);
      const profile = formData.get("profileImage");
      const event = formData.get("eventImage");
      profileImage = profile instanceof File && profile.size > 0 ? profile : null;
      eventImage = event instanceof File && event.size > 0 ? event : null;
    } else {
      const body = await request.json();
      const parsed = reviewSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json({ error: "Ungültige Bewertungsdaten." }, { status: 400 });
      }

      ({ name, eventType, rating, text, website, _formLoadedAt: formLoadedAt } = parsed.data);
    }

    const spamError = validateSpamGuard({ website, _formLoadedAt: formLoadedAt });
    if (spamError) {
      return NextResponse.json({ error: spamError }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let profile_image_url: string | null = null;
    let event_image_url: string | null = null;

    if (profileImage) {
      const uploaded = await uploadImage("reviews", profileImage, "profiles");
      profile_image_url = toStoragePath("reviews", uploaded.path);
    }

    if (eventImage) {
      const uploaded = await uploadImage("reviews", eventImage, "events");
      event_image_url = toStoragePath("reviews", uploaded.path);
    }

    const { error } = await supabase.from("reviews").insert({
      name: stripHtml(name),
      event_type: eventType,
      rating,
      text: stripHtml(text),
      approved: false,
      profile_image_url,
      event_image_url,
      verified: false,
    });

    if (error) {
      safeApiError("Review insert:", error, "");
      return NextResponse.json({ error: "Bewertung konnte nicht gespeichert werden." }, { status: 500 });
    }

    if (isResendConfigured()) {
      try {
        const { sendReviewNotification } = await import("@/lib/email");
        await sendReviewNotification({
          name: stripHtml(name),
          eventType,
          rating,
          text: stripHtml(text),
          submittedAt: new Date().toLocaleString("de-DE"),
        });
      } catch (emailErr) {
        safeApiError("Review notification email:", emailErr, "");
      }
    }

    return NextResponse.json({
      success: true,
      message: "Vielen Dank! Eure Bewertung wurde eingereicht und wird nach Prüfung veröffentlicht.",
    });
  } catch (error) {
    safeApiError("Review API:", error, "");
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`reviews-get:${ip}`, 120, 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { reviews: [], error: "Zu viele Anfragen. Bitte kurz warten." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ reviews: [] });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("reviews")
      .select(
        "id, name, event_type, rating, text, created_at, profile_image_url, event_image_url, admin_reply, verified",
      )
      .eq("approved", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      safeApiError("Reviews fetch:", error, "");
      return NextResponse.json({ reviews: [], error: "Bewertungen konnten nicht geladen werden." }, { status: 500 });
    }

    const reviews = (data ?? []).map((row) => mapReviewRow(row as Record<string, unknown>));

    return NextResponse.json(
      { reviews },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    safeApiError("Reviews GET:", error, "");
    return NextResponse.json({ reviews: [], error: "Bewertungen konnten nicht geladen werden." }, { status: 500 });
  }
}
