import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { EmailLogRecord } from "@/lib/cms/types";

export interface LogEmailInput {
  recipient: string;
  subject: string;
  templateSlug?: string | null;
  area?: string | null;
  status: "sent" | "failed";
  errorMessage?: string | null;
  sentByAdminId?: string | null;
  relatedCustomerId?: string | null;
  relatedQuoteId?: string | null;
  relatedInvoiceId?: string | null;
}

function mapRow(row: Record<string, unknown>): EmailLogRecord {
  return {
    id: String(row.id),
    recipient: String(row.recipient),
    subject: String(row.subject),
    template_slug: row.template_slug != null ? String(row.template_slug) : null,
    area: row.area != null ? String(row.area) : null,
    status: row.status === "failed" ? "failed" : "sent",
    error_message: row.error_message != null ? String(row.error_message) : null,
    sent_by_admin_id: row.sent_by_admin_id != null ? String(row.sent_by_admin_id) : null,
    related_customer_id: row.related_customer_id != null ? String(row.related_customer_id) : null,
    related_quote_id: row.related_quote_id != null ? String(row.related_quote_id) : null,
    related_invoice_id: row.related_invoice_id != null ? String(row.related_invoice_id) : null,
    created_at: String(row.created_at),
  };
}

export async function logEmailSend(input: LogEmailInput): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("email_logs").insert({
    recipient: input.recipient,
    subject: input.subject,
    template_slug: input.templateSlug ?? null,
    area: input.area ?? null,
    status: input.status,
    error_message: input.errorMessage ?? null,
    sent_by_admin_id: input.sentByAdminId ?? null,
    related_customer_id: input.relatedCustomerId ?? null,
    related_quote_id: input.relatedQuoteId ?? null,
    related_invoice_id: input.relatedInvoiceId ?? null,
  });
}

export async function listEmailLogs(limit = 50): Promise<EmailLogRecord[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("email_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function saveEmailDraft(input: {
  id?: string;
  recipient?: string;
  subject?: string;
  bodyHtml?: string;
  templateSlug?: string;
  adminId?: string;
}): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseAdmin();
  const payload = {
    recipient: input.recipient ?? null,
    subject: input.subject ?? null,
    body_html: input.bodyHtml ?? null,
    template_slug: input.templateSlug ?? null,
    created_by_admin_id: input.adminId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    await supabase.from("email_drafts").update(payload).eq("id", input.id);
    return input.id;
  }

  const { data } = await supabase.from("email_drafts").insert(payload).select("id").single();
  return data?.id ? String(data.id) : null;
}

export async function listEmailDrafts(adminId?: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabaseAdmin();
  let query = supabase.from("email_drafts").select("*").order("updated_at", { ascending: false }).limit(20);
  if (adminId) query = query.eq("created_by_admin_id", adminId);
  const { data } = await query;
  return data ?? [];
}
