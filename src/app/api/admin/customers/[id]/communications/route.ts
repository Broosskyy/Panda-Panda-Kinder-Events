import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-route";
import { listEmailLogsByCustomer, listEmailLogsByRecipientEmail } from "@/lib/email/log";
import { getCustomer } from "@/lib/crm/db";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const { id } = await context.params;
  const { searchParams } = new URL(_request.url);
  const daysParam = searchParams.get("days");
  const days = daysParam === "all" ? undefined : Number(daysParam) || undefined;

  const customer = await getCustomer(id);
  if (!customer) {
    return NextResponse.json({ error: "Kunde nicht gefunden." }, { status: 404 });
  }

  const byCustomer = await listEmailLogsByCustomer(id, { days, limit: 100 });
  const byEmail = customer.email
    ? await listEmailLogsByRecipientEmail(customer.email, { days, limit: 100 })
    : [];

  const merged = [...byCustomer, ...byEmail].filter(
    (log, index, arr) => arr.findIndex((x) => x.id === log.id) === index,
  );
  merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json({ communications: merged });
}
