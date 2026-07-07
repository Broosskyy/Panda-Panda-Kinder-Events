import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { createCustomerFromBooking } from "@/lib/crm/db";
import { createCustomerFromBookingSchema } from "@/lib/crm/schemas";

export async function POST(request: Request) {
  const authError = await requireAdmin("customers:write");
  if (authError) return authError;

  const body = await request.json();
  const parsed = createCustomerFromBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  try {
    const customer = await createCustomerFromBooking(parsed.data.booking_id);
    return NextResponse.json({ customer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kunde konnte nicht angelegt werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
