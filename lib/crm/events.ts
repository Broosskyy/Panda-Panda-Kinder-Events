import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function logCustomerEvent(
  customerId: string,
  eventType: string,
  title: string,
  details?: string | null,
  reference?: { id: string; type: string },
) {
  const supabase = getSupabaseAdmin();
  await supabase.from("crm_customer_events").insert({
    customer_id: customerId,
    event_type: eventType,
    title,
    details: details ?? null,
    reference_id: reference?.id ?? null,
    reference_type: reference?.type ?? null,
  });
}

export async function fetchCustomerHistory(customerId: string) {
  const supabase = getSupabaseAdmin();

  const [events, bookings, quotes, invoices] = await Promise.all([
    supabase
      .from("crm_customer_events")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("booking_requests")
      .select("id, created_at, event_type, event_date, status")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_quotes")
      .select("id, quote_number, title, status, total_cents, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_invoices")
      .select("id, invoice_number, title, status, total_cents, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
  ]);

  return {
    events: events.data ?? [],
    bookings: bookings.data ?? [],
    quotes: quotes.data ?? [],
    invoices: invoices.data ?? [],
  };
}

export async function fetchCrmDashboardStats() {
  const supabase = getSupabaseAdmin();

  const [customers, openQuotes, openInvoices, paidInvoices] = await Promise.all([
    supabase.from("crm_customers").select("id", { count: "exact", head: true }),
    supabase
      .from("crm_quotes")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "sent", "open"]),
    supabase
      .from("crm_invoices")
      .select("id", { count: "exact", head: true })
      .in("status", ["sent", "open", "confirmed"]),
    supabase.from("crm_invoices").select("total_cents").eq("status", "paid"),
  ]);

  const revenueCents = (paidInvoices.data ?? []).reduce((sum, row) => sum + (row.total_cents ?? 0), 0);

  return {
    customersCount: customers.count ?? 0,
    openQuotesCount: openQuotes.count ?? 0,
    openInvoicesCount: openInvoices.count ?? 0,
    revenueCents,
  };
}
