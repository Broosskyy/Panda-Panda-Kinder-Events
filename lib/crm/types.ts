export type CrmCustomerStatus = "active" | "inactive" | "lead";

export type CrmDocumentStatus = "draft" | "sent" | "confirmed" | "paid" | "open" | "cancelled";

export interface CrmCustomer {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: CrmCustomerStatus;
}

export interface CrmLineItem {
  id?: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents?: number;
  sort_order?: number;
}

export interface CrmQuote {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  booking_request_id: string | null;
  quote_number: string;
  title: string;
  status: CrmDocumentStatus;
  remarks: string | null;
  discount_percent: number;
  tax_rate: number;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  valid_until: string | null;
  sent_at: string | null;
  deleted_at?: string | null;
  archived_at?: string | null;
  cancelled_at?: string | null;
  cancelled_reason?: string | null;
  items?: CrmLineItem[];
  customer?: CrmCustomer;
}

export interface CrmInvoice {
  id: string;
  created_at: string;
  updated_at: string;
  customer_id: string;
  quote_id: string | null;
  invoice_number: string;
  title: string;
  status: CrmDocumentStatus;
  remarks: string | null;
  discount_percent: number;
  tax_rate: number;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  issue_date: string;
  due_date: string | null;
  sent_at: string | null;
  paid_at: string | null;
  deleted_at?: string | null;
  archived_at?: string | null;
  cancelled_at?: string | null;
  cancelled_reason?: string | null;
  items?: CrmLineItem[];
  customer?: CrmCustomer;
}

export interface CrmCustomerEvent {
  id: string;
  created_at: string;
  customer_id: string;
  event_type: string;
  title: string;
  details: string | null;
  reference_id: string | null;
  reference_type: string | null;
}

export interface CrmDashboardStats {
  customersCount: number;
  openQuotesCount: number;
  openInvoicesCount: number;
  revenueCents: number;
}

export const CRM_STATUS_LABELS: Record<CrmDocumentStatus, string> = {
  draft: "Entwurf",
  sent: "Gesendet",
  confirmed: "Angenommen",
  paid: "Bezahlt",
  open: "Offen",
  cancelled: "Storniert",
};

export const CRM_CUSTOMER_STATUS_LABELS: Record<CrmCustomerStatus, string> = {
  active: "Aktiv",
  inactive: "Inaktiv",
  lead: "Interessent",
};
