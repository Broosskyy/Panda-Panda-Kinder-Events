import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { calculateDocumentTotals } from "./money";
import { nextDocumentNumber } from "./numbers";
import { logCustomerEvent } from "./events";
import { logCrmAudit } from "./audit-log";
import type { AdminContext } from "@/lib/auth/types";
import type { CrmCustomer, CrmInvoice, CrmLineItem, CrmQuote } from "./types";

export type CrmListView = "active" | "archived" | "all";

function applyDocumentView<T extends { deleted_at?: string | null; archived_at?: string | null }>(
  rows: T[],
  view: CrmListView,
): T[] {
  return rows.filter((row) => {
    if (row.deleted_at) return false;
    if (view === "archived") return Boolean(row.archived_at);
    if (view === "active") return !row.archived_at;
    return true;
  });
}

export async function listCustomers(search?: string, view: "active" | "archived" | "all" = "active") {
  const supabase = getSupabaseAdmin();
  let query = supabase.from("crm_customers").select("*").order("updated_at", { ascending: false });

  if (view === "active") {
    query = query.neq("status", "inactive");
  } else if (view === "archived") {
    query = query.eq("status", "inactive");
  }

  if (search?.trim()) {
    const term = search.trim().replace(/"/g, '""');
    const pattern = `"%${term}%"`;
    query = query.or(`name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as CrmCustomer[];
}

export interface CustomerDeleteBlockers {
  quotes: number;
  invoices: number;
  bookings: number;
}

export async function getCustomerDeleteBlockers(customerId: string): Promise<CustomerDeleteBlockers> {
  const { getCustomerDependencies } = await import("./customer-dependencies");
  const deps = await getCustomerDependencies(customerId);
  return {
    quotes: deps.quotes,
    invoices: deps.invoices,
    bookings: deps.inquiries,
  };
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

export async function archiveCustomerRecord(customerId: string): Promise<CrmCustomer> {
  const supabase = getSupabaseAdmin();
  const existing = await getCustomer(customerId);
  if (!existing) throw new Error("Kunde nicht gefunden.");

  const { data, error } = await supabase
    .from("crm_customers")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", customerId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logCustomerEvent(customerId, "customer_archived", "Kunde archiviert", existing.name);
  return data as CrmCustomer;
}

export async function restoreCustomerRecord(customerId: string): Promise<CrmCustomer> {
  const supabase = getSupabaseAdmin();
  const existing = await getCustomer(customerId);
  if (!existing) throw new Error("Kunde nicht gefunden.");

  const { data, error } = await supabase
    .from("crm_customers")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", customerId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logCustomerEvent(customerId, "customer_restored", "Kunde wiederhergestellt", existing.name);
  return data as CrmCustomer;
}

export async function deleteCustomerRecord(customerId: string): Promise<void> {
  const { getCustomerDependencies, hasBlockingDependencies, sanitizeCrmDbError } = await import(
    "./customer-dependencies"
  );
  const dependencies = await getCustomerDependencies(customerId);
  if (hasBlockingDependencies(dependencies)) {
    const parts: string[] = [];
    if (dependencies.inquiries > 0) parts.push(`${dependencies.inquiries} Anfrage(n)`);
    if (dependencies.quotes > 0) parts.push(`${dependencies.quotes} Angebot(e)`);
    if (dependencies.invoices > 0) parts.push(`${dependencies.invoices} Rechnung(en)`);
    throw new Error(`Dieser Kunde kann nicht gelöscht werden, weil noch ${parts.join(", ")} verknüpft sind.`);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("crm_customers").delete().eq("id", customerId);
  if (error) {
    console.error("[crm] deleteCustomerRecord failed:", error.message);
    throw new Error(sanitizeCrmDbError(error.message, "delete_customer"));
  }
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

export async function listQuotes(search?: string, view: CrmListView = "active") {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("crm_quotes")
    .select("*, customer:crm_customers(id, name, email)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  let results = applyDocumentView(data ?? [], view);
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

export async function duplicateQuote(id: string, ctx: AdminContext | null) {
  void ctx;
  const source = await getQuoteWithDetails(id);
  if (!source || source.deleted_at) throw new Error("Angebot nicht gefunden.");
  if (!source.items?.length) throw new Error("Angebot hat keine Positionen.");

  const duplicate = await createQuote({
    customer_id: source.customer_id,
    booking_request_id: source.booking_request_id,
    title: source.title.includes("(Kopie)") ? source.title : `${source.title} (Kopie)`,
    status: "draft",
    remarks: source.remarks,
    discount_percent: source.discount_percent,
    tax_rate: source.tax_rate,
    valid_until: source.valid_until,
    items: source.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      sort_order: item.sort_order,
    })),
  });

  return duplicate;
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

export async function listInvoices(search?: string, view: CrmListView = "active") {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("crm_invoices")
    .select("*, customer:crm_customers(id, name, email)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  let results = applyDocumentView(data ?? [], view);
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

export async function archiveQuote(id: string, ctx: AdminContext | null) {
  const quote = await getQuoteWithDetails(id);
  if (!quote || quote.deleted_at) throw new Error("Angebot nicht gefunden.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("crm_quotes")
    .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logCrmAudit(ctx, "quote_archived", id, { documentNumber: quote.quote_number });
  await logCustomerEvent(quote.customer_id, "quote_archived", `Angebot ${quote.quote_number} archiviert`, null, {
    id,
    type: "quote",
  });
}

export async function restoreQuote(id: string, ctx: AdminContext | null) {
  const quote = await getQuoteWithDetails(id);
  if (!quote || quote.deleted_at) throw new Error("Angebot nicht gefunden.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("crm_quotes")
    .update({ archived_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logCrmAudit(ctx, "quote_restored", id, { documentNumber: quote.quote_number });
}

export async function deleteQuote(id: string, ctx: AdminContext | null) {
  const quote = await getQuoteWithDetails(id);
  if (!quote || quote.deleted_at) throw new Error("Angebot nicht gefunden.");

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("crm_quotes")
    .update({ deleted_at: now, updated_at: now })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logCrmAudit(ctx, "quote_deleted", id, { documentNumber: quote.quote_number });
  await logCustomerEvent(quote.customer_id, "quote_deleted", `Angebot ${quote.quote_number} gelöscht`, null, {
    id,
    type: "quote",
  });
}

export async function archiveInvoice(id: string, ctx: AdminContext | null) {
  const invoice = await getInvoiceWithDetails(id);
  if (!invoice || invoice.deleted_at) throw new Error("Rechnung nicht gefunden.");
  if (invoice.status === "paid") {
    // paid invoices: archive only, never delete
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("crm_invoices")
    .update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logCrmAudit(ctx, "invoice_archived", id, { documentNumber: invoice.invoice_number });
  await logCustomerEvent(invoice.customer_id, "invoice_archived", `Rechnung ${invoice.invoice_number} archiviert`, null, {
    id,
    type: "invoice",
  });
}

export async function restoreInvoice(id: string, ctx: AdminContext | null) {
  const invoice = await getInvoiceWithDetails(id);
  if (!invoice || invoice.deleted_at) throw new Error("Rechnung nicht gefunden.");

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("crm_invoices")
    .update({ archived_at: null, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logCrmAudit(ctx, "invoice_restored", id, { documentNumber: invoice.invoice_number });
}

export async function cancelInvoice(id: string, ctx: AdminContext | null, reason?: string) {
  const invoice = await getInvoiceWithDetails(id);
  if (!invoice || invoice.deleted_at) throw new Error("Rechnung nicht gefunden.");
  if (invoice.status === "paid") throw new Error("Bezahlte Rechnungen können nicht storniert werden.");

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("crm_invoices")
    .update({
      status: "cancelled",
      cancelled_at: now,
      cancelled_reason: reason?.trim() || null,
      updated_at: now,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logCrmAudit(ctx, "invoice_cancelled", id, {
    documentNumber: invoice.invoice_number,
    note: reason,
  });
  await logCustomerEvent(invoice.customer_id, "invoice_cancelled", `Rechnung ${invoice.invoice_number} storniert`, reason ?? null, {
    id,
    type: "invoice",
  });

  return getInvoiceWithDetails(id);
}

export async function bulkArchiveQuotes(ids: string[], ctx: AdminContext | null) {
  for (const id of ids) {
    await archiveQuote(id, ctx);
  }
}

export async function bulkDeleteQuotes(ids: string[], ctx: AdminContext | null) {
  for (const id of ids) {
    await deleteQuote(id, ctx);
  }
}

export async function bulkArchiveInvoices(ids: string[], ctx: AdminContext | null) {
  for (const id of ids) {
    await archiveInvoice(id, ctx);
  }
}

export async function bulkDeleteInvoices(ids: string[], ctx: AdminContext | null) {
  for (const id of ids) {
    await deleteInvoice(id, ctx);
  }
}

export async function deleteInvoice(id: string, ctx: AdminContext | null) {
  const invoice = await getInvoiceWithDetails(id);
  if (!invoice || invoice.deleted_at) throw new Error("Rechnung nicht gefunden.");

  if (invoice.status !== "draft") {
    throw new Error("Nur Rechnungs-Entwürfe können gelöscht werden. Gesendete oder bezahlte Rechnungen bitte archivieren oder stornieren.");
  }

  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("crm_invoices")
    .update({ deleted_at: now, updated_at: now })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logCrmAudit(ctx, "invoice_deleted", id, { documentNumber: invoice.invoice_number });
  await logCustomerEvent(invoice.customer_id, "invoice_deleted", `Rechnung ${invoice.invoice_number} gelöscht`, null, {
    id,
    type: "invoice",
  });
}
