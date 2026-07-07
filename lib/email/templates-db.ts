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
    name: "Anfrage: Bestätigung an Kunde",
    subject: "Eure Anfrage bei {{company_name}} — wir melden uns",
    body_html: `<p>Hallo {{customer_name}},</p>
<p>vielen Dank für eure Anfrage.</p>
<p>Wir haben eure Nachricht erhalten und melden uns persönlich innerhalb von 24 Stunden zurück.</p>
<p>Bis dahin könnt ihr euch entspannt zurücklehnen — wir schauen uns euren Anlass in Ruhe an.</p>`,
    body_text: `Hallo {{customer_name}},

vielen Dank für eure Anfrage.

Wir haben eure Nachricht erhalten und melden uns persönlich innerhalb von 24 Stunden zurück.

Bis dahin könnt ihr euch entspannt zurücklehnen — wir schauen uns euren Anlass in Ruhe an.`,
    area: "inquiry",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name"],
  },
  {
    slug: "inquiry-admin",
    name: "Anfrage: Benachrichtigung an Admin",
    subject: "Neue Anfrage — {{event_type}} ({{customer_name}})",
    body_html: `<p><strong>Neue Anfrage eingegangen</strong></p>
<p>Name: {{customer_name}}<br/>Telefon: {{customer_phone}}<br/>E-Mail: {{customer_email}}<br/>Event-Art: {{event_type}}<br/>Datum: {{event_date}}<br/>Kinder: {{children_count}}</p>
<p><strong>Nachricht:</strong><br/>{{message}}</p>`,
    body_text: `Neue Kontaktanfrage über die Website

Name: {{customer_name}}
Telefon: {{customer_phone}}
E-Mail: {{customer_email}}
Eventart: {{event_type}}
Datum: {{event_date}}
Kinder: {{children_count}}

Nachricht:
{{message}}`,
    area: "inquiry",
    is_active: true,
    is_default: true,
    variables: ["customer_name", "customer_phone", "customer_email", "event_type", "event_date", "children_count", "message"],
  },
  {
    slug: "review-request",
    name: "Bewertungsanfrage",
    subject: "Wie war euer Event mit uns? — {{company_name}}",
    body_html: `<p>Hallo {{customer_name}},</p>
<p>wir hoffen, ihr hattet einen wunderschönen Tag!</p>
<p>Wenn ihr möchtet, freuen wir uns über eine kurze Bewertung:</p>
<p><a href="{{review_link}}">Jetzt Bewertung abgeben</a></p>
<p>Herzliche Grüße<br/><strong>Euer Panda-Bande Team</strong></p>`,
    body_text: `Hallo {{customer_name}},

wir hoffen, ihr hattet einen wunderschönen Tag!

Wenn ihr möchtet, freuen wir uns über eine kurze Bewertung:
{{review_link}}

Herzliche Grüße
Euer Panda-Bande Team`,
    area: "review",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "review_link"],
  },
  {
    slug: "review-admin",
    name: "Neue Bewertung an Admin",
    subject: "Neue Bewertung — {{event_type}} ({{customer_name}})",
    body_html: `<p><strong>Neue Bewertung wartet auf Prüfung</strong></p>
<p>Name: {{customer_name}}<br/>Event-Art: {{event_type}}<br/>Sterne: {{rating}} / 5</p>
<p><strong>Text:</strong><br/>{{message}}</p>`,
    body_text: `Neue Bewertung eingegangen

Name: {{customer_name}}
Anlass: {{event_type}}
Bewertung: {{rating}} / 5

Text:
{{message}}`,
    area: "review",
    is_active: true,
    is_default: true,
    variables: ["customer_name", "event_type", "rating", "message"],
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
    name: "Passwort vergessen",
    subject: "Passwort zurücksetzen — {{company_name}}",
    body_html: `<p>Hallo {{admin_name}},</p>
<p>Sie haben eine Passwort-Zurücksetzung angefordert.</p>
<p><a href="{{reset_link}}">Passwort zurücksetzen</a></p>
<p>Der Link ist 1 Stunde gültig und kann nur einmal verwendet werden.</p>`,
    body_text: `Hallo {{admin_name}},

Sie haben eine Passwort-Zurücksetzung angefordert.

Klicken Sie hier: {{reset_link}}

Der Link ist 1 Stunde gültig und kann nur einmal verwendet werden.`,
    area: "password_reset",
    is_active: true,
    is_default: true,
    variables: ["company_name", "admin_name", "reset_link"],
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

export function getDefaultTemplateBySlug(slug: string): Omit<EmailTemplateRecord, "id" | "created_at" | "updated_at"> | null {
  return DEFAULT_TEMPLATES.find((t) => t.slug === slug) ?? null;
}

export async function resetEmailTemplateToDefault(slug: string): Promise<EmailTemplateRecord> {
  const defaults = getDefaultTemplateBySlug(slug);
  if (!defaults) throw new Error(`Keine Standard-Vorlage für „${slug}".`);

  if (!isSupabaseConfigured()) {
    const now = new Date().toISOString();
    return { ...defaults, id: `fallback-reset-${slug}`, created_at: now, updated_at: now };
  }

  return upsertEmailTemplate({
    slug: defaults.slug,
    name: defaults.name,
    subject: defaults.subject,
    body_html: defaults.body_html,
    body_text: defaults.body_text,
    area: defaults.area,
    is_active: defaults.is_active,
    is_default: defaults.is_default,
    variables: defaults.variables,
  });
}
