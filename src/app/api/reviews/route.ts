import { NextResponse } from "next/server";
import { z } from "zod";
import { eventTypes } from "@/lib/faqs";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

const reviewSchema = z.object({
  name: z.string().min(2, "Bitte gib deinen Namen ein."),
  eventType: z.enum(eventTypes),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(10, "Bitte schreibe mindestens 10 Zeichen."),
});

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Bewertungen sind derzeit nicht verfügbar. Bitte später erneut versuchen." },
        { status: 503 },
      );
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Bewertungsdaten.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, eventType, rating, text } = parsed.data;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from("reviews").insert({
      name,
      event_type: eventType,
      rating,
      text,
      approved: false,
    });

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json(
        { error: "Bewertung konnte nicht gespeichert werden." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "Vielen Dank! Eure Bewertung wurde eingereicht und wird nach Prüfung veröffentlicht.",
    });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ error: "Ein unerwarteter Fehler ist aufgetreten." }, { status: 500 });
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
      .select("id, name, event_type, rating, text, created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Reviews fetch error:", error);
      return NextResponse.json({ reviews: [] });
    }

    return NextResponse.json({ reviews: data ?? [] });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ reviews: [] });
  }
}
