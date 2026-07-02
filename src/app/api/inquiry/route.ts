import { NextResponse } from "next/server";
import { z } from "zod";
import { eventTypes } from "@/lib/faqs";
import { sendInquiryNotification, isResendConfigured } from "@/lib/email";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

const inquiryApiSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  eventType: z.enum(eventTypes),
  date: z.string().min(1),
  time: z.string().min(1),
  duration: z.string().optional(),
  location: z.string().min(3),
  childrenCount: z.string().min(1),
  message: z.string().optional(),
  privacy: z.literal(true),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = inquiryApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Formulardaten.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = parsed.data;
    const childrenCount = parseInt(data.childrenCount, 10);

    if (isNaN(childrenCount) || childrenCount < 1) {
      return NextResponse.json({ error: "Ungültige Kinderanzahl." }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      const { error: dbError } = await supabase.from("booking_requests").insert({
        name: data.name,
        phone: data.phone,
        email: data.email,
        event_type: data.eventType,
        event_date: data.date,
        event_time: data.time,
        duration: data.duration || null,
        location: data.location,
        children_count: childrenCount,
        message: data.message || null,
        status: "new",
      });

      if (dbError) {
        console.error("Supabase insert error:", dbError);
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
          duration: data.duration,
          location: data.location,
          childrenCount: data.childrenCount,
          message: data.message,
        });
      } catch (emailError) {
        console.error("Resend error:", emailError);
        if (!isSupabaseConfigured()) {
          return NextResponse.json(
            { error: "E-Mail konnte nicht gesendet werden. Bitte kontaktiert uns direkt." },
            { status: 500 },
          );
        }
      }
    } else if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            "Formular ist noch nicht vollständig konfiguriert. Bitte .env.local mit Supabase und Resend einrichten.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Inquiry API error:", error);
    return NextResponse.json(
      { error: "Ein unerwarteter Fehler ist aufgetreten." },
      { status: 500 },
    );
  }
}
