import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** FK-relevant counts — includes soft-deleted and archived rows still linked via customer_id. */
export interface CustomerDependencies {
  quotes: number;
  invoices: number;
  inquiries: number;
}

export interface CustomerDependenciesResponse {
  canDelete: boolean;
  dependencies: CustomerDependencies;
}

const FK_ERROR_PATTERNS = [
  "foreign key constraint",
  "violates foreign key",
  "crm_quotes_customer_id_fkey",
  "crm_invoices_customer_id_fkey",
  "booking_requests_customer_id_fkey",
] as const;

export function sanitizeCrmDbError(message: string, context: "delete_customer" | "generic" = "generic"): string {
  const lower = message.toLowerCase();
  if (FK_ERROR_PATTERNS.some((p) => lower.includes(p.toLowerCase()))) {
    if (context === "delete_customer") {
      return "Dieser Kunde kann nicht gelöscht werden, weil noch Daten verknüpft sind. Bitte „Verknüpfte Daten“ prüfen oder den Kunden archivieren.";
    }
    return "Die Aktion ist wegen bestehender Verknüpfungen nicht möglich. Bitte die verknüpften Daten prüfen.";
  }
  return message;
}

export async function getCustomerDependencies(customerId: string): Promise<CustomerDependencies> {
  const supabase = getSupabaseAdmin();

  const [quotes, invoices, inquiries] = await Promise.all([
    supabase
      .from("crm_quotes")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId),
    supabase
      .from("crm_invoices")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId),
    supabase
      .from("booking_requests")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId),
  ]);

  if (quotes.error) throw new Error(quotes.error.message);
  if (invoices.error) throw new Error(invoices.error.message);
  if (inquiries.error) throw new Error(inquiries.error.message);

  return {
    quotes: quotes.count ?? 0,
    invoices: invoices.count ?? 0,
    inquiries: inquiries.count ?? 0,
  };
}

export function hasBlockingDependencies(deps: CustomerDependencies): boolean {
  return deps.quotes > 0 || deps.invoices > 0 || deps.inquiries > 0;
}

export async function getCustomerDependenciesResponse(customerId: string): Promise<CustomerDependenciesResponse> {
  const dependencies = await getCustomerDependencies(customerId);
  return {
    canDelete: !hasBlockingDependencies(dependencies),
    dependencies,
  };
}

export type DocumentVisibility = "active" | "archived" | "soft_deleted";

export function documentVisibility(row: {
  deleted_at?: string | null;
  archived_at?: string | null;
}): DocumentVisibility {
  if (row.deleted_at) return "soft_deleted";
  if (row.archived_at) return "archived";
  return "active";
}

export const VISIBILITY_LABELS: Record<DocumentVisibility, string> = {
  active: "Aktiv",
  archived: "Archiviert",
  soft_deleted: "Ausgeblendet (Alt-Datensatz)",
};
