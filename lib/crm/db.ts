import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calculateDocumentTotals } from "./money";
import { nextDocumentNumber } from "./numbers";
import { logCustomerEvent } from "./events";
import type { CrmCustomer, CrmInvoice, CrmLineItem, CrmQuote } from "./types";

export async function listCustomers(search?: string) {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("crm_customers").select("*").order("updated_at", { ascending: false });

  if (search?.trim()) {
    const q = `%${search.trim()}%`;
    query = query.or(`name.ilike.${q},email.ilike.${q},phone.ilike.${q}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as CrmCustomer[];
}

export async function getCustomer(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("crm_customers").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as CrmCustomer | null;
}

export async function createCustomerFromBooking(bookingId: string) {
  const supabase = getSupabaseAdmin();
  const { data: booking, error: bookingError } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) throw new Error("Anfrage nicht gefunden.");

  if (booking.customer_id) {
    const existing = await getCustomer(booking.customer_id);
    if (existing) return existing;
  }

  const { data: customer, error } = await supabase
    .from("crm_customers")
    .insert({
      name: booking.name,
      phone: booking.phone,
      email: booking.email,
      address: booking.location,
      notes: booking.message,
      status: "lead",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("booking_requests").update({ customer_id: customer.id }).eq("id", bookingId);

  await logCustomerEvent(customer.id, "customer_created", "Kunde aus Anfrage angelegt", booking.event_type, {
    id: bookingId,
    type: "booking",
  });

  return customer as CrmCustomer;
}

async function insertLineItems(
  table: "crm_quote_items" | "crm_invoice_items",
  foreignKey: "quote_id" | "invoice_id",
  parentId: string,
  items: CrmLineItem[],
  totals: ReturnType<typeof calculateDocumentTotals>,
) {
  const supabase = getSupabaseAdmin();
  const rows = items.map((item, index) => ({
    [foreignKey]: parentId,
    sort_order: item.sort_order ?? index,
    description: item.description,
    quantity: item.quantity,
    unit_price_cents: item.unit_price_cents,
    line_total_cents: totals.items[index]?.line_total_cents ?? 0,
  }));

  const { error } = await supabase.from(table).insert(rows);
  if (error) throw new Error(error.message);
}

export async function getQuoteWithDetails(id: string) {
  const supabase = getSupabaseAdmin();
  const { data: quote, error } = await supabase.from("crm_quotes").select("*").eq("id", id).maybeSingle();
  if (error || !quote) return null;

  const [customer, items] = await Promise.all([
    getCustomer(quote.customer_id),
    supabase.from("crm_quote_items").select("*").eq("quote_id", id).order("sort_order"),
  ]);

  return {
    ...(quote as CrmQuote),
    customer: customer ?? undefined,
    items: (items.data ?? []) as CrmLineItem[],
  };
}

export async function listQuotes(search?: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("crm_quotes")
    .select("*, customer:crm_customers(id, name, email)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  let results = data ?? [];
  if (search?.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (row) =>
        row.quote_number?.toLowerCase().includes(q) ||
        row.title?.toLowerCase().includes(q) ||
        row.customer?.name?.toLowerCase().includes(q),
    );
  }
  return results;
}

export async function createQuote(input: {
  customer_id: string;
  booking_request_id?: string | null;
  title: string;
  status: string;
  remarks?: string | null;
  discount_percent: number;
  tax_rate: number;
  valid_until?: string | null;
  items: CrmLineItem[];
}) {
  const quoteNumber = await nextDocumentNumber("quote");
  const totals = calculateDocumentTotals(input.items, input.discount_percent, input.tax_rate);
  const supabase = getSupabaseAdmin();

  const { data: quote, error } = await supabase
    .from("crm_quotes")
    .insert({
      customer_id: input.customer_id,
      booking_request_id: input.booking_request_id ?? null,
      quote_number: quoteNumber,
      title: input.title,
      status: input.status,
      remarks: input.remarks ?? null,
      discount_percent: input.discount_percent,
      tax_rate: input.tax_rate,
      valid_until: input.valid_until ?? null,
      subtotal_cents: totals.subtotal_cents,
      discount_cents: totals.discount_cents,
      tax_cents: totals.tax_cents,
      total_cents: totals.total_cents,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await insertLineItems("crm_quote_items", "quote_id", quote.id, input.items, totals);
  await logCustomerEvent(input.customer_id, "quote_created", `Angebot ${quoteNumber} erstellt`, input.title, {
    id: quote.id,
    type: "quote",
  });

  return getQuoteWithDetails(quote.id);
}

export async function updateQuote(
  id: string,
  input: Partial<{
    title: string;
    status: string;
    remarks: string | null;
    discount_percent: number;
    tax_rate: number;
    valid_until: string | null;
    items: CrmLineItem[];
  }>,
) {
  const existing = await getQuoteWithDetails(id);
  if (!existing) throw new Error("Angebot nicht gefunden.");

  const supabase = getSupabaseAdmin();
  const items = input.items ?? existing.items ?? [];
  const discount = input.discount_percent ?? existing.discount_percent;
  const taxRate = input.tax_rate ?? existing.tax_rate;
  const totals = calculateDocumentTotals(items, discount, taxRate);

  const { error } = await supabase
    .from("crm_quotes")
    .update({
      title: input.title ?? existing.title,
      status: input.status ?? existing.status,
      remarks: input.remarks !== undefined ? input.remarks : existing.remarks,
      discount_percent: discount,
      tax_rate: taxRate,
      valid_until: input.valid_until !== undefined ? input.valid_until : existing.valid_until,
      subtotal_cents: totals.subtotal_cents,
      discount_cents: totals.discount_cents,
      tax_cents: totals.tax_cents,
      total_cents: totals.total_cents,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  if (input.items) {
    await supabase.from("crm_quote_items").delete().eq("quote_id", id);
    await insertLineItems("crm_quote_items", "quote_id", id, items, totals);
  }

  return getQuoteWithDetails(id);
}

export async function getInvoiceWithDetails(id: string) {
  const supabase = getSupabaseAdmin();
  const { data: invoice, error } = await supabase.from("crm_invoices").select("*").eq("id", id).maybeSingle();
  if (error || !invoice) return null;

  const [customer, items] = await Promise.all([
    getCustomer(invoice.customer_id),
    supabase.from("crm_invoice_items").select("*").eq("invoice_id", id).order("sort_order"),
  ]);

  return {
    ...(invoice as CrmInvoice),
    customer: customer ?? undefined,
    items: (items.data ?? []) as CrmLineItem[],
  };
}

export async function listInvoices(search?: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("crm_invoices")
    .select("*, customer:crm_customers(id, name, email)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  let results = data ?? [];
  if (search?.trim()) {
    const q = search.toLowerCase();
    results = results.filter(
      (row) =>
        row.invoice_number?.toLowerCase().includes(q) ||
        row.title?.toLowerCase().includes(q) ||
        row.customer?.name?.toLowerCase().includes(q),
    );
  }
  return results;
}

export async function createInvoiceFromQuote(quoteId: string) {
  const quote = await getQuoteWithDetails(quoteId);
  if (!quote || !quote.items?.length) throw new Error("Angebot nicht gefunden.");

  const invoiceNumber = await nextDocumentNumber("invoice");
  const supabase = getSupabaseAdmin();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const { data: invoice, error } = await supabase
    .from("crm_invoices")
    .insert({
      customer_id: quote.customer_id,
      quote_id: quote.id,
      invoice_number: invoiceNumber,
      title: `Rechnung zu ${quote.quote_number}`,
      status: "draft",
      remarks: quote.remarks,
      discount_percent: quote.discount_percent,
      tax_rate: quote.tax_rate,
      subtotal_cents: quote.subtotal_cents,
      discount_cents: quote.discount_cents,
      tax_cents: quote.tax_cents,
      total_cents: quote.total_cents,
      issue_date: new Date().toISOString().slice(0, 10),
      due_date: dueDate.toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  const items = quote.items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit_price_cents: item.unit_price_cents,
    sort_order: item.sort_order,
  }));

  const totals = calculateDocumentTotals(items, quote.discount_percent, quote.tax_rate);
  await insertLineItems("crm_invoice_items", "invoice_id", invoice.id, items, totals);

  await logCustomerEvent(quote.customer_id, "invoice_created", `Rechnung ${invoiceNumber} aus Angebot`, quote.quote_number, {
    id: invoice.id,
    type: "invoice",
  });

  return getInvoiceWithDetails(invoice.id);
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = getSupabaseAdmin();
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "paid") updates.paid_at = new Date().toISOString();
  if (status === "sent") updates.sent_at = new Date().toISOString();

  const { error } = await supabase.from("crm_invoices").update(updates).eq("id", id);
  if (error) throw new Error(error.message);

  const invoice = await getInvoiceWithDetails(id);
  if (invoice) {
    await logCustomerEvent(invoice.customer_id, "invoice_status", `Rechnung ${invoice.invoice_number}: ${status}`, null, {
      id,
      type: "invoice",
    });
  }
  return invoice;
}

export async function markQuoteSent(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("crm_quotes")
    .update({ status: "sent", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
