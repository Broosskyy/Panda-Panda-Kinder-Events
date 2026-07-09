import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { CRM_STATUS_LABELS } from "./types";
import type { CustomerDeleteBlockers } from "./db";

export type CustomerLinkType = "booking" | "quote" | "invoice" | "review" | "event";

export interface CustomerLinkAction {
  canOpen: boolean;
  canUnlink: boolean;
  unlinkReason: string | null;
  canArchive: boolean;
  archiveReason: string | null;
  canDelete: boolean;
  deleteReason: string | null;
}

export interface CustomerLinkItem {
  id: string;
  type: CustomerLinkType;
  label: string;
  subtitle: string;
  href: string;
  status: string;
  actions: CustomerLinkAction;
}

export interface CustomerLinksSummary extends CustomerDeleteBlockers {
  events: number;
  reviews: number;
}

export interface CustomerLinksPayload {
  summary: CustomerLinksSummary;
  canDelete: boolean;
  canPermanentDelete: boolean;
  permanentDeleteReasons: string[];
  bookings: CustomerLinkItem[];
  quotes: CustomerLinkItem[];
  invoices: CustomerLinkItem[];
  reviews: CustomerLinkItem[];
  events: CustomerLinkItem[];
}

const BILLING_INVOICE_STATUSES = new Set(["sent", "confirmed", "paid", "open"]);
const QUOTE_UNLINK_STATUSES = new Set(["draft", "sent", "open"]);

function bookingActions(): CustomerLinkAction {
  return {
    canOpen: true,
    canUnlink: true,
    unlinkReason: null,
    canArchive: true,
    archiveReason: null,
    canDelete: false,
    deleteReason: "Anfragen werden archiviert oder von der Verknüpfung gelöst, nicht gelöscht.",
  };
}

function quoteActions(status: string, hasInvoice: boolean): CustomerLinkAction {
  const canUnlink = QUOTE_UNLINK_STATUSES.has(status) && !hasInvoice;
  let unlinkReason: string | null = null;
  if (!canUnlink) {
    if (hasInvoice) {
      unlinkReason = "Dieses Angebot hat eine verknüpfte Rechnung und kann nicht vom Kunden gelöst werden.";
    } else if (status === "confirmed") {
      unlinkReason = "Angenommene Angebote können nicht vom Kunden gelöst werden.";
    } else if (status === "paid") {
      unlinkReason = "Abgerechnete Angebote können nicht vom Kunden gelöst werden.";
    } else if (status === "cancelled") {
      unlinkReason = "Stornierte Angebote können nicht vom Kunden gelöst werden.";
    } else {
      unlinkReason = "Dieses Angebot kann in seinem aktuellen Status nicht gelöst werden.";
    }
  }

  const canArchive = status !== "cancelled";
  return {
    canOpen: true,
    canUnlink,
    unlinkReason,
    canArchive,
    archiveReason: canArchive ? null : "Stornierte Angebote sind bereits abgeschlossen.",
    canDelete: status === "draft" && !hasInvoice,
    deleteReason:
      status === "draft" && !hasInvoice
        ? null
        : "Nur Entwürfe ohne Rechnung können gelöscht werden.",
  };
}

function invoiceActions(status: string): CustomerLinkAction {
  const billingRelevant = BILLING_INVOICE_STATUSES.has(status);
  return {
    canOpen: true,
    canUnlink: false,
    unlinkReason: billingRelevant
      ? "Diese Rechnung kann nicht vom Kunden gelöst werden, da sie abrechnungsrelevant ist."
      : "Rechnungen bleiben dem Kunden zugeordnet. Nutzen Sie Archivieren oder Stornieren.",
    canArchive: status !== "cancelled",
    archiveReason: status === "cancelled" ? "Stornierte Rechnungen sind bereits abgeschlossen." : null,
    canDelete: false,
    deleteReason: "Rechnungen werden aus rechtlichen Gründen nicht gelöscht.",
  };
}

export async function fetchCustomerLinks(customerId: string): Promise<CustomerLinksPayload> {
  const supabase = getSupabaseAdmin();

  const customerRes = await supabase.from("crm_customers").select("name, email").eq("id", customerId).maybeSingle();
  if (!customerRes.data) throw new Error("Kunde nicht gefunden.");
  const customerName = customerRes.data.name?.trim() ?? "";

  const [bookings, quotes, invoices, events, reviews, quoteInvoiceRows] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("id, event_type, event_date, status, archived_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_quotes")
      .select("id, quote_number, title, status, total_cents, archived_at, deleted_at")
      .eq("customer_id", customerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_invoices")
      .select("id, invoice_number, title, status, total_cents, archived_at, deleted_at")
      .eq("customer_id", customerId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_customer_events")
      .select("id, title, details, created_at, event_type")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(50),
    customerName
      ? supabase
          .from("reviews")
          .select("id, name, event_type, rating, text, created_at")
          .eq("approved", true)
          .ilike("name", customerName)
          .order("created_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [], error: null }),
    supabase.from("crm_invoices").select("quote_id").eq("customer_id", customerId).is("deleted_at", null),
  ]);

  if (bookings.error) throw new Error(bookings.error.message);
  if (quotes.error) throw new Error(quotes.error.message);
  if (invoices.error) throw new Error(invoices.error.message);
  if (events.error) throw new Error(events.error.message);
  if (reviews.error) throw new Error(reviews.error.message);
  if (quoteInvoiceRows.error) throw new Error(quoteInvoiceRows.error.message);

  const quotesWithInvoice = new Set(
    (quoteInvoiceRows.data ?? []).map((row) => row.quote_id).filter((id): id is string => Boolean(id)),
  );

  const bookingItems: CustomerLinkItem[] = (bookings.data ?? []).map((b) => ({
    id: b.id,
    type: "booking",
    label: `${b.event_type} · ${b.event_date}`,
    subtitle: b.archived_at ? "Archiviert" : b.status,
    href: `/admin/anfragen/`,
    status: b.status,
    actions: bookingActions(),
  }));

  const quoteItems: CustomerLinkItem[] = (quotes.data ?? []).map((q) => ({
    id: q.id,
    type: "quote",
    label: q.quote_number,
    subtitle: `${CRM_STATUS_LABELS[q.status as keyof typeof CRM_STATUS_LABELS] ?? q.status}${q.archived_at ? " · archiviert" : ""}`,
    href: `/admin/angebote/`,
    status: q.status,
    actions: quoteActions(q.status, quotesWithInvoice.has(q.id)),
  }));

  const invoiceItems: CustomerLinkItem[] = (invoices.data ?? []).map((i) => ({
    id: i.id,
    type: "invoice",
    label: i.invoice_number,
    subtitle: `${CRM_STATUS_LABELS[i.status as keyof typeof CRM_STATUS_LABELS] ?? i.status}${i.archived_at ? " · archiviert" : ""}`,
    href: `/admin/rechnungen/`,
    status: i.status,
    actions: invoiceActions(i.status),
  }));

  const reviewItems: CustomerLinkItem[] = (reviews.data ?? []).map((r) => ({
    id: r.id,
    type: "review",
    label: `${r.rating}/5 · ${r.event_type}`,
    subtitle: r.text.slice(0, 80),
    href: `/admin/bewertungen/`,
    status: "approved",
    actions: {
      canOpen: true,
      canUnlink: false,
      unlinkReason: "Bewertungen sind nicht direkt verknüpft und können nicht gelöst werden.",
      canArchive: false,
      archiveReason: "Bewertungen werden über die Bewertungsverwaltung gepflegt.",
      canDelete: false,
      deleteReason: "Bewertungen werden nicht über die Kundenverwaltung gelöscht.",
    },
  }));

  const eventItems: CustomerLinkItem[] = (events.data ?? []).map((e) => ({
    id: e.id,
    type: "event",
    label: e.title,
    subtitle: e.details ?? e.event_type,
    href: "",
    status: e.event_type,
    actions: {
      canOpen: false,
      canUnlink: false,
      unlinkReason: "Aktivitätsprotokolle können nicht gelöst werden.",
      canArchive: false,
      archiveReason: "Aktivitäten bleiben zur Nachvollziehbarkeit erhalten.",
      canDelete: false,
      deleteReason: "Aktivitätsprotokolle dürfen nicht gelöscht werden.",
    },
  }));

  const summary: CustomerLinksSummary = {
    bookings: bookingItems.length,
    quotes: quoteItems.length,
    invoices: invoiceItems.length,
    events: eventItems.length,
    reviews: reviewItems.length,
  };

  const permanentDeleteReasons: string[] = [];
  if (summary.invoices > 0) permanentDeleteReasons.push(`${summary.invoices} Rechnung(en) vorhanden`);
  if (summary.quotes > 0) permanentDeleteReasons.push(`${summary.quotes} Angebot(e) vorhanden`);
  if (summary.bookings > 0) permanentDeleteReasons.push(`${summary.bookings} Anfrage(n) verknüpft`);

  const canDelete = summary.bookings === 0 && summary.quotes === 0 && summary.invoices === 0;
  const canPermanentDelete = canDelete;

  return {
    summary,
    canDelete,
    canPermanentDelete,
    permanentDeleteReasons,
    bookings: bookingItems,
    quotes: quoteItems,
    invoices: invoiceItems,
    reviews: reviewItems,
    events: eventItems,
  };
}

export async function unlinkBookingFromCustomer(customerId: string, bookingId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: booking, error } = await supabase
    .from("booking_requests")
    .select("id, customer_id, event_type")
    .eq("id", bookingId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!booking || booking.customer_id !== customerId) {
    throw new Error("Anfrage nicht gefunden oder gehört nicht zu diesem Kunden.");
  }

  const { error: updateError } = await supabase
    .from("booking_requests")
    .update({ customer_id: null })
    .eq("id", bookingId);
  if (updateError) throw new Error(updateError.message);
}

export async function unlinkQuoteFromCustomer(customerId: string, quoteId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: quote, error } = await supabase
    .from("crm_quotes")
    .select("id, customer_id, status, quote_number, deleted_at")
    .eq("id", quoteId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!quote || quote.deleted_at || quote.customer_id !== customerId) {
    throw new Error("Angebot nicht gefunden oder gehört nicht zu diesem Kunden.");
  }

  const { count } = await supabase
    .from("crm_invoices")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", quoteId)
    .is("deleted_at", null);

  const actions = quoteActions(quote.status, (count ?? 0) > 0);
  if (!actions.canUnlink) {
    throw new Error(actions.unlinkReason ?? "Angebot kann nicht gelöst werden.");
  }

  const { error: updateError } = await supabase
    .from("crm_quotes")
    .update({ customer_id: null, updated_at: new Date().toISOString() })
    .eq("id", quoteId);
  if (updateError) throw new Error(updateError.message);
}
