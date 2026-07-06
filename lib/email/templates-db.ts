import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { EmailTemplateArea, EmailTemplateRecord } from "@/lib/cms/types";

const DEFAULT_TEMPLATES: Omit<EmailTemplateRecord, "id" | "created_at" | "updated_at">[] = [
  {
    slug: "general-message",
    name: "Allgemeine Nachricht",
    subject: "Nachricht von {{company_name}}",
    body_html: "<p>Guten Tag {{customer_name}},</p><p>{{message}}</p>",
    body_text: "Guten Tag {{customer_name}},\n\n{{message}}",
    area: "general",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "message"],
  },
  {
    slug: "inquiry-auto-reply",
    name: "Kontaktformular Auto-Reply",
    subject: "Vielen Dank für Ihre Anfrage — {{company_name}}",
    body_html:
      "<p>Guten Tag {{customer_name}},</p><p>vielen Dank für Ihre Anfrage. Wir melden uns innerhalb von 24 Stunden.</p>",
    body_text:
      "Guten Tag {{customer_name}},\n\nvielen Dank für Ihre Anfrage. Wir melden uns innerhalb von 24 Stunden.",
    area: "inquiry",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name"],
  },
  {
    slug: "quote-send",
    name: "Angebot senden",
    subject: "Ihr Angebot {{quote_number}} — {{company_name}}",
    body_html:
      "<p>Guten Tag {{customer_name}},</p><p>anbei unser Angebot <strong>{{quote_number}}</strong>. Gesamtbetrag: <strong>{{total_amount}}</strong></p>",
    body_text: "Guten Tag {{customer_name}},\n\nAngebot {{quote_number}}\nGesamtbetrag: {{total_amount}}",
    area: "quote",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "quote_number", "total_amount"],
  },
  {
    slug: "invoice-send",
    name: "Rechnung senden",
    subject: "Ihre Rechnung {{invoice_number}} — {{company_name}}",
    body_html:
      "<p>Guten Tag {{customer_name}},</p><p>Rechnung <strong>{{invoice_number}}</strong>. Gesamtbetrag: <strong>{{total_amount}}</strong>. Fällig: {{due_date}}</p>",
    body_text:
      "Guten Tag {{customer_name}},\n\nRechnung {{invoice_number}}\nGesamtbetrag: {{total_amount}}\nFällig: {{due_date}}",
    area: "invoice",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "invoice_number", "total_amount", "due_date"],
  },
  {
    slug: "password-reset",
    name: "Passwort zurücksetzen",
    subject: "Passwort zurücksetzen — {{company_name}}",
    body_html: "<p>Guten Tag,</p><p>Sie haben eine Passwort-Zurücksetzung angefordert.</p>",
    body_text: "Guten Tag,\n\nSie haben eine Passwort-Zurücksetzung angefordert.",
    area: "password_reset",
    is_active: true,
    is_default: true,
    variables: ["company_name"],
  },
  {
    slug: "security-login",
    name: "Login/Security Hinweis",
    subject: "Sicherheitshinweis — {{company_name}}",
    body_html: "<p>Es gab eine Anmeldung in Ihrem Admin-Konto.</p>",
    body_text: "Es gab eine Anmeldung in Ihrem Admin-Konto.",
    area: "security",
    is_active: true,
    is_default: true,
    variables: ["company_name", "admin_name"],
  },
];

function mapRow(row: Record<string, unknown>): EmailTemplateRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    subject: String(row.subject ?? ""),
    body_html: String(row.body_html ?? ""),
    body_text: row.body_text != null ? String(row.body_text) : null,
    area: row.area as EmailTemplateArea,
    is_active: Boolean(row.is_active),
    is_default: Boolean(row.is_default),
    variables: Array.isArray(row.variables) ? row.variables.map(String) : [],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

function fallbackTemplates(): EmailTemplateRecord[] {
  const now = new Date().toISOString();
  return DEFAULT_TEMPLATES.map((t, i) => ({
    ...t,
    id: `fallback-${i}`,
    created_at: now,
    updated_at: now,
  }));
}

export async function listEmailTemplates(): Promise<EmailTemplateRecord[]> {
  if (!isSupabaseConfigured()) return fallbackTemplates();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("email_templates").select("*").order("area").order("name");
  if (error || !data?.length) return fallbackTemplates();
  return data.map((row) => mapRow(row as Record<string, unknown>));
}

export async function getEmailTemplateBySlug(slug: string): Promise<EmailTemplateRecord | null> {
  const all = await listEmailTemplates();
  return all.find((t) => t.slug === slug) ?? null;
}

export async function getDefaultTemplateForArea(area: EmailTemplateArea): Promise<EmailTemplateRecord | null> {
  const all = await listEmailTemplates();
  return all.find((t) => t.area === area && t.is_default && t.is_active) ?? all.find((t) => t.area === area) ?? null;
}

export async function upsertEmailTemplate(
  template: Partial<EmailTemplateRecord> & { slug: string; name: string },
): Promise<EmailTemplateRecord> {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase nicht konfiguriert — Vorlagen können nicht gespeichert werden.");
  }
  const supabase = getSupabaseAdmin();
  const payload = {
    slug: template.slug,
    name: template.name,
    subject: template.subject ?? "",
    body_html: template.body_html ?? "",
    body_text: template.body_text ?? null,
    area: template.area ?? "general",
    is_active: template.is_active ?? true,
    is_default: template.is_default ?? false,
    variables: template.variables ?? [],
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("email_templates")
    .upsert(payload, { onConflict: "slug" })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Vorlage konnte nicht gespeichert werden.");
  return mapRow(data as Record<string, unknown>);
}

export async function deleteEmailTemplate(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabaseAdmin();
  await supabase.from("email_templates").delete().eq("slug", slug);
}
