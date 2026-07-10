import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { CRM_STATUS_LABELS } from "./types";
import type { CustomerDeleteBlockers } from "./db";
import {
  documentVisibility,
  getCustomerDependencies,
  hasBlockingDependencies,
  VISIBILITY_LABELS,
  type DocumentVisibility,
} from "./customer-dependencies";

export type CustomerLinkType = "booking" | "quote" | "invoice" | "review" | "event";

export interface CustomerLinkAction {
  canOpen: boolean;
  canUnlink: boolean;
  unlinkReason: string | null;
  canReassignCustomer: boolean;
  reassignReason: string | null;
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
  createdAt: string;
  visibility: DocumentVisibility;
  isArchived: boolean;
  isDeleted: boolean;
  actions: CustomerLinkAction;
}

export interface CustomerLinksSummary extends CustomerDeleteBlockers {
  events: number;
  reviews: number;
}

export interface CustomerLinksPayload {
  summary: CustomerLinksSummary;
  dependencies: {
    quotes: number;
    inquiries: number;
    invoices: number;
  };
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

function formatDateDe(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function bookingActions(): CustomerLinkAction {
  return {
    canOpen: true,
    canUnlink: true,
    unlinkReason: null,
    canReassignCustomer: false,
    reassignReason: "Anfragen werden einem anderen Kunden nicht zugeordnet — bitte Verknüpfung lösen.",
    canArchive: true,
    archiveReason: null,
    canDelete: false,
    deleteReason: "Anfragen werden archiviert oder von der Verknüpfung gelöst, nicht gelöscht.",
  };
}

function quoteActions(status: string, hasInvoice: boolean, visibility: DocumentVisibility): CustomerLinkAction {
  const canUnlink = QUOTE_UNLINK_STATUSES.has(status) && !hasInvoice && visibility !== "soft_deleted";
  let unlinkReason: string | null = null;
  if (!canUnlink) {
    if (visibility === "soft_deleted") {
      unlinkReason =
        "Ausgeblendetes Angebot: Kunde ändern oder endgültig löschen, um den Kunden freizugeben.";
    } else if (hasInvoice) {
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

  const canArchive = status !== "cancelled" && visibility !== "soft_deleted";
  const canDelete =
    visibility === "soft_deleted" || (status === "draft" && !hasInvoice && visibility === "active");

  return {
    canOpen: true,
    canUnlink,
    unlinkReason,
    canReassignCustomer: true,
    reassignReason: null,
    canArchive,
    archiveReason: canArchive ? null : "Stornierte oder ausgeblendete Angebote sind bereits abgeschlossen.",
    canDelete,
    deleteReason: canDelete ? null : "Nur Entwürfe ohne Rechnung oder ausgeblendete Alt-Datensätze können entfernt werden.",
  };
}

function invoiceActions(status: string, visibility: DocumentVisibility): CustomerLinkAction {
  const billingRelevant = BILLING_INVOICE_STATUSES.has(status);
  return {
    canOpen: true,
    canUnlink: false,
    unlinkReason: billingRelevant
      ? "Diese Rechnung kann nicht vom Kunden gelöst werden, da sie abrechnungsrelevant ist."
      : "Rechnungen bleiben dem Kunden zugeordnet. Nutzen Sie Archivieren oder Stornieren.",
    canReassignCustomer: false,
    reassignReason: "Rechnungen können nicht einem anderen Kunden zugeordnet werden.",
    canArchive: status !== "cancelled" && visibility !== "soft_deleted",
    archiveReason:
      status === "cancelled" || visibility === "soft_deleted"
        ? "Stornierte oder ausgeblendete Rechnungen sind bereits abgeschlossen."
        : null,
    canDelete: false,
    deleteReason: "Rechnungen werden aus rechtlichen Gründen nicht gelöscht.",
  };
}

function buildQuoteSubtitle(
  status: string,
  visibility: DocumentVisibility,
  createdAt: string,
  archivedAt: string | null,
): string {
  const statusLabel = CRM_STATUS_LABELS[status as keyof typeof CRM_STATUS_LABELS] ?? status;
  const parts = [
    `Status: ${statusLabel}`,
    `Erstellt: ${formatDateDe(createdAt)}`,
    `Archiviert: ${archivedAt ? "Ja" : "Nein"}`,
    VISIBILITY_LABELS[visibility],
  ];
  if (visibility === "soft_deleted") {
    parts.push("Blockiert das Löschen des Kunden, bis der Datensatz einem anderen Kunden zugeordnet oder entfernt wird.");
  }
  return parts.join(" · ");
}

export async function fetchCustomerLinks(customerId: string): Promise<CustomerLinksPayload> {
  const supabase = getSupabaseAdmin();

  const customerRes = await supabase.from("crm_customers").select("name, email").eq("id", customerId).maybeSingle();
  if (!customerRes.data) throw new Error("Kunde nicht gefunden.");
  const customerName = customerRes.data.name?.trim() ?? "";

  const dependencies = await getCustomerDependencies(customerId);

  const [bookings, quotes, invoices, events, reviews, quoteInvoiceRows] = await Promise.all([
    supabase
      .from("booking_requests")
      .select("id, event_type, event_date, status, archived_at, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_quotes")
      .select("id, quote_number, title, status, total_cents, archived_at, deleted_at, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("crm_invoices")
      .select("id, invoice_number, title, status, total_cents, archived_at, deleted_at, created_at")
      .eq("customer_id", customerId)
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
    supabase.from("crm_invoices").select("quote_id").eq("customer_id", customerId),
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
    subtitle: `${b.status}${b.archived_at ? " · archiviert" : ""} · Erstellt: ${formatDateDe(b.created_at)}`,
    href: `/admin/anfragen/${b.id}`,
    status: b.status,
    createdAt: b.created_at,
    visibility: b.archived_at ? "archived" : "active",
    isArchived: Boolean(b.archived_at),
    isDeleted: false,
    actions: bookingActions(),
  }));

  const quoteItems: CustomerLinkItem[] = (quotes.data ?? []).map((q) => {
    const visibility = documentVisibility(q);
    return {
      id: q.id,
      type: "quote",
      label: q.quote_number,
      subtitle: buildQuoteSubtitle(q.status, visibility, q.created_at, q.archived_at),
      href: `/admin/angebote/${q.id}`,
      status: q.status,
      createdAt: q.created_at,
      visibility,
      isArchived: Boolean(q.archived_at),
      isDeleted: Boolean(q.deleted_at),
      actions: quoteActions(q.status, quotesWithInvoice.has(q.id), visibility),
    };
  });

  const invoiceItems: CustomerLinkItem[] = (invoices.data ?? []).map((i) => {
    const visibility = documentVisibility(i);
    return {
      id: i.id,
      type: "invoice",
      label: i.invoice_number,
      subtitle: `${CRM_STATUS_LABELS[i.status as keyof typeof CRM_STATUS_LABELS] ?? i.status} · Erstellt: ${formatDateDe(i.created_at)} · Archiviert: ${i.archived_at ? "Ja" : "Nein"} · ${VISIBILITY_LABELS[visibility]}`,
      href: `/admin/rechnungen/${i.id}`,
      status: i.status,
      createdAt: i.created_at,
      visibility,
      isArchived: Boolean(i.archived_at),
      isDeleted: Boolean(i.deleted_at),
      actions: invoiceActions(i.status, visibility),
    };
  });

  const reviewItems: CustomerLinkItem[] = (reviews.data ?? []).map((r) => ({
    id: r.id,
    type: "review",
    label: `${r.rating}/5 · ${r.event_type}`,
    subtitle: r.text.slice(0, 80),
    href: `/admin/bewertungen/`,
    status: "approved",
    createdAt: r.created_at,
    visibility: "active" as const,
    isArchived: false,
    isDeleted: false,
    actions: {
      canOpen: true,
      canUnlink: false,
      unlinkReason: "Bewertungen sind nicht direkt verknüpft und können nicht gelöst werden.",
      canReassignCustomer: false,
      reassignReason: "Bewertungen können keinem anderen Kunden zugeordnet werden.",
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
    createdAt: e.created_at,
    visibility: "active" as const,
    isArchived: false,
    isDeleted: false,
    actions: {
      canOpen: false,
      canUnlink: false,
      unlinkReason: "Aktivitätsprotokolle können nicht gelöst werden.",
      canReassignCustomer: false,
      reassignReason: "Aktivitäten können keinem anderen Kunden zugeordnet werden.",
      canArchive: false,
      archiveReason: "Aktivitäten bleiben zur Nachvollziehbarkeit erhalten.",
      canDelete: false,
      deleteReason: "Aktivitätsprotokolle dürfen nicht gelöscht werden.",
    },
  }));

  const summary: CustomerLinksSummary = {
    bookings: dependencies.inquiries,
    quotes: dependencies.quotes,
    invoices: dependencies.invoices,
    events: eventItems.length,
    reviews: reviewItems.length,
  };

  const permanentDeleteReasons: string[] = [];
  if (dependencies.invoices > 0) permanentDeleteReasons.push(`${dependencies.invoices} Rechnung(en) vorhanden`);
  if (dependencies.quotes > 0) permanentDeleteReasons.push(`${dependencies.quotes} Angebot(e) vorhanden`);
  if (dependencies.inquiries > 0) permanentDeleteReasons.push(`${dependencies.inquiries} Anfrage(n) verknüpft`);

  const canDelete = !hasBlockingDependencies(dependencies);

  return {
    summary,
    dependencies: {
      quotes: dependencies.quotes,
      inquiries: dependencies.inquiries,
      invoices: dependencies.invoices,
    },
    canDelete,
    canPermanentDelete: canDelete,
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
  if (!quote || quote.customer_id !== customerId) {
    throw new Error("Angebot nicht gefunden oder gehört nicht zu diesem Kunden.");
  }

  const { count } = await supabase
    .from("crm_invoices")
    .select("id", { count: "exact", head: true })
    .eq("quote_id", quoteId);

  const visibility = quote.deleted_at ? "soft_deleted" : "active";
  const actions = quoteActions(quote.status, (count ?? 0) > 0, visibility);
  if (!actions.canUnlink) {
    throw new Error(actions.unlinkReason ?? "Angebot kann nicht gelöst werden.");
  }

  const { error: updateError } = await supabase
    .from("crm_quotes")
    .update({ customer_id: null, updated_at: new Date().toISOString() })
    .eq("id", quoteId);
  if (updateError) throw new Error(updateError.message);
}

export async function detachSoftDeletedQuoteFromCustomer(customerId: string, quoteId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { data: quote, error } = await supabase
    .from("crm_quotes")
    .select("id, customer_id, deleted_at, quote_number")
    .eq("id", quoteId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!quote || quote.customer_id !== customerId) {
    throw new Error("Angebot nicht gefunden oder gehört nicht zu diesem Kunden.");
  }
  if (!quote.deleted_at) {
    throw new Error("Nur ausgeblendete Alt-Datensätze können auf diese Weise entfernt werden.");
  }

  const { error: updateError } = await supabase
    .from("crm_quotes")
    .update({ customer_id: null, updated_at: new Date().toISOString() })
    .eq("id", quoteId);
  if (updateError) throw new Error(updateError.message);
}

export async function reassignQuoteToCustomer(
  fromCustomerId: string,
  quoteId: string,
  toCustomerId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (fromCustomerId === toCustomerId) {
    throw new Error("Bitte einen anderen Kunden auswählen.");
  }

  const [{ data: quote, error: quoteError }, { data: target, error: targetError }] = await Promise.all([
    supabase
      .from("crm_quotes")
      .select("id, customer_id, quote_number, status, deleted_at")
      .eq("id", quoteId)
      .maybeSingle(),
    supabase.from("crm_customers").select("id, name").eq("id", toCustomerId).maybeSingle(),
  ]);

  if (quoteError) throw new Error(quoteError.message);
  if (targetError) throw new Error(targetError.message);
  if (!quote || quote.customer_id !== fromCustomerId) {
    throw new Error("Angebot nicht gefunden oder gehört nicht zu diesem Kunden.");
  }
  if (!target) throw new Error("Ziel-Kunde nicht gefunden.");

  const { error: updateError } = await supabase
    .from("crm_quotes")
    .update({ customer_id: toCustomerId, updated_at: new Date().toISOString() })
    .eq("id", quoteId);
  if (updateError) throw new Error(updateError.message);
}
