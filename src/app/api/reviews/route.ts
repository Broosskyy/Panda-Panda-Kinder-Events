import { NextResponse } from "next/server";
import { z } from "zod";
import { eventTypes } from "@/lib/faqs";
import { uploadImage } from "@/lib/cms/storage";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

const reviewSchema = z.object({
  name: z.string().min(2, "Bitte gib deinen Namen ein."),
  eventType: z.enum(eventTypes),
  rating: z.coerce.number().int().min(1).max(5),
  text: z.string().min(10, "Bitte schreibe mindestens 10 Zeichen."),
});

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Bewertungen sind derzeit nicht verfügbar. Bitte später erneut versuchen." },
        { status: 503 },
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    let name: string;
    let eventType: (typeof eventTypes)[number];
    let rating: number;
    let text: string;
    let profileImage: File | null = null;
    let eventImage: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const parsed = reviewSchema.safeParse({
        name: formData.get("name"),
        eventType: formData.get("eventType"),
        rating: formData.get("rating"),
        text: formData.get("text"),
      });

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Ungültige Bewertungsdaten.", details: parsed.error.flatten() },
          { status: 400 },
        );
      }

      ({ name, eventType, rating, text } = parsed.data);
      const profile = formData.get("profileImage");
      const event = formData.get("eventImage");
      profileImage = profile instanceof File && profile.size > 0 ? profile : null;
      eventImage = event instanceof File && event.size > 0 ? event : null;
    } else {
      const body = await request.json();
      const parsed = reviewSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: "Ungültige Bewertungsdaten.", details: parsed.error.flatten() },
          { status: 400 },
        );
      }

      ({ name, eventType, rating, text } = parsed.data);
    }

    const supabase = getSupabaseAdmin();
    let profile_image_url: string | null = null;
    let event_image_url: string | null = null;

    if (profileImage) {
      const uploaded = await uploadImage("reviews", profileImage, "profiles");
      profile_image_url = uploaded.url;
    }

    if (eventImage) {
      const uploaded = await uploadImage("reviews", eventImage, "events");
      event_image_url = uploaded.url;
    }

    const { error } = await supabase.from("reviews").insert({
      name,
      event_type: eventType,
      rating,
      text,
      approved: false,
      profile_image_url,
      event_image_url,
      verified: false,
    });

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json({ error: "Bewertung konnte nicht gespeichert werden." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Vielen Dank! Eure Bewertung wurde eingereicht und wird nach Prüfung veröffentlicht.",
    });
  } catch (error) {
    console.error("Review API error:", error);
    const message = error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);
      return NextResponse.json({ reviews: [] });
    }

    return NextResponse.json({ reviews: data ?? [] }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ reviews: [] });
  }
}
