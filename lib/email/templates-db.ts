import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";
import type { EmailTemplateArea, EmailTemplateLayout, EmailTemplateRecord } from "@/lib/cms/types";

type DefaultTemplate = Omit<EmailTemplateRecord, "id" | "created_at" | "updated_at">;

const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    slug: "general-message",
    name: "Allgemeine Nachricht",
    description: "Freie Nachricht an Kunden oder Partner.",
    subject: "Nachricht von {{company_name}}",
    body_html: "",
    body_text: "Guten Tag {{customer_name}},\n\n{{message}}",
    layout: {
      headline: "Nachricht von {{company_name}}",
      intro: "Guten Tag {{customer_name}},",
      body: "{{message}}",
      footerEnabled: true,
    },
    area: "general",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "message"],
  },
  {
    slug: "inquiry-auto-reply",
    name: "Anfrage: Bestätigung an Kunde",
    description: "Automatische Bestätigung nach einer Kontaktanfrage.",
    subject: "Eure Anfrage bei {{company_name}} — wir melden uns",
    body_html: "",
    body_text: `Hallo {{customer_name}},

vielen Dank für eure Anfrage.

Wir haben eure Nachricht erhalten und melden uns persönlich innerhalb von 24 Stunden zurück.

Bis dahin könnt ihr euch entspannt zurücklehnen — wir schauen uns euren Anlass in Ruhe an.`,
    layout: {
      headline: "Vielen Dank für eure Anfrage",
      intro: "Hallo {{customer_name}},",
      body: "Wir haben eure Nachricht erhalten und melden uns persönlich innerhalb von 24 Stunden zurück.\n\nBis dahin könnt ihr euch entspannt zurücklehnen — wir schauen uns euren Anlass in Ruhe an.",
      infoBoxEnabled: true,
      infoBoxItems: ["Anfrage erhalten", "Persönliche Rückmeldung", "Kostenlos & unverbindlich"],
      ctaText: "Zur Website",
      ctaUrl: "{{website}}",
      footerEnabled: true,
    },
    area: "inquiry",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "website"],
  },
  {
    slug: "inquiry-admin",
    name: "Anfrage: Benachrichtigung an Admin",
    description: "Interne Benachrichtigung bei neuer Kontaktanfrage.",
    subject: "Neue Anfrage — {{event_type}} ({{customer_name}})",
    body_html: "",
    body_text: `Neue Kontaktanfrage über die Website

Name: {{customer_name}}
Telefon: {{customer_phone}}
E-Mail: {{customer_email}}
Eventart: {{event_type}}
Datum: {{event_date}}
Kinder: {{children_count}}

Nachricht:
{{message}}`,
    layout: {
      headline: "Neue Anfrage eingegangen",
      intro: "Eine neue Anfrage ist über die Website eingegangen.",
      body: "Name: {{customer_name}}\nTelefon: {{customer_phone}}\nE-Mail: {{customer_email}}\nEvent-Art: {{event_type}}\nDatum: {{event_date}}\nKinder: {{children_count}}\n\nNachricht:\n{{message}}",
      ctaText: "Anfrage im Admin öffnen",
      ctaUrl: "{{admin_url}}",
      footerEnabled: false,
    },
    area: "inquiry",
    is_active: true,
    is_default: true,
    variables: ["customer_name", "customer_phone", "customer_email", "event_type", "event_date", "children_count", "message", "admin_url"],
  },
  {
    slug: "review-request",
    name: "Bewertungsanfrage",
    description: "Bitte um eine Bewertung nach dem Event.",
    subject: "Wie war euer Event mit uns? — {{company_name}}",
    body_html: "",
    body_text: `Hallo {{customer_name}},

wir hoffen, ihr hattet einen wunderschönen Tag!

Wenn ihr möchtet, freuen wir uns über eine kurze Bewertung:
{{review_link}}

Herzliche Grüße
Ihr {{company_name}} Team`,
    layout: {
      headline: "Wie war euer Event?",
      intro: "Hallo {{customer_name}},",
      body: "Wir hoffen, ihr hattet einen wunderschönen Tag!\n\nWenn ihr möchtet, freuen wir uns über eine kurze Bewertung.",
      ctaText: "Jetzt Bewertung abgeben",
      ctaUrl: "{{review_link}}",
      footerEnabled: true,
    },
    area: "review",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "review_link"],
  },
  {
    slug: "review-admin",
    name: "Neue Bewertung an Admin",
    description: "Interne Benachrichtigung bei neuer Bewertung.",
    subject: "Neue Bewertung — {{event_type}} ({{customer_name}})",
    body_html: "",
    body_text: `Neue Bewertung eingegangen

Name: {{customer_name}}
Anlass: {{event_type}}
Bewertung: {{rating}} / 5

Text:
{{message}}`,
    layout: {
      headline: "Neue Bewertung wartet auf Prüfung",
      intro: "Eine neue Bewertung ist eingegangen.",
      body: "Name: {{customer_name}}\nEvent-Art: {{event_type}}\nSterne: {{rating}} / 5\n\nText:\n{{message}}",
      ctaText: "Bewertung im Admin prüfen",
      ctaUrl: "{{admin_url}}",
      footerEnabled: false,
    },
    area: "review",
    is_active: true,
    is_default: true,
    variables: ["customer_name", "event_type", "rating", "message", "admin_url"],
  },
  {
    slug: "quote-send",
    name: "Angebot senden",
    description: "Begleittext beim Versand eines Angebots (PDF im Anhang).",
    subject: "Ihr Angebot {{quote_number}} — {{company_name}}",
    body_html: "",
    body_text: "Guten Tag {{customer_name}},\n\nAngebot {{quote_number}}\nGesamtbetrag: {{total_amount}}",
    layout: {
      headline: "Ihr Angebot {{quote_number}}",
      intro: "Guten Tag {{customer_name}},",
      body: "Anbei erhalten Sie unser Angebot als PDF.\n\nGesamtbetrag: {{total_amount}}",
      footerEnabled: true,
    },
    area: "quote",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "quote_number", "total_amount"],
  },
  {
    slug: "invoice-send",
    name: "Rechnung senden",
    description: "Begleittext beim Versand einer Rechnung (PDF im Anhang).",
    subject: "Ihre Rechnung {{invoice_number}} — {{company_name}}",
    body_html: "",
    body_text: "Guten Tag {{customer_name}},\n\nRechnung {{invoice_number}}\nGesamtbetrag: {{total_amount}}\nFällig: {{due_date}}",
    layout: {
      headline: "Ihre Rechnung {{invoice_number}}",
      intro: "Guten Tag {{customer_name}},",
      body: "Anbei erhalten Sie Ihre Rechnung als PDF.\n\nGesamtbetrag: {{total_amount}}\nFällig: {{due_date}}",
      footerEnabled: true,
    },
    area: "invoice",
    is_active: true,
    is_default: true,
    variables: ["company_name", "customer_name", "invoice_number", "total_amount", "due_date"],
  },
  {
    slug: "password-reset",
    name: "Passwort vergessen",
    description: "Link zum Zurücksetzen des Admin-Passworts.",
    subject: "Passwort zurücksetzen — {{company_name}}",
    body_html: "",
    body_text: `Hallo {{admin_name}},

Sie haben eine Passwort-Zurücksetzung angefordert.

Klicken Sie hier: {{reset_link}}

Der Link ist 1 Stunde gültig und kann nur einmal verwendet werden.`,
    layout: {
      headline: "Passwort zurücksetzen",
      intro: "Hallo {{admin_name}},",
      body: "Sie haben eine Passwort-Zurücksetzung angefordert.\n\nDer Link ist 1 Stunde gültig und kann nur einmal verwendet werden.",
      ctaText: "Passwort zurücksetzen",
      ctaUrl: "{{reset_link}}",
      footerEnabled: true,
    },
    area: "password_reset",
    is_active: true,
    is_default: true,
    variables: ["company_name", "admin_name", "reset_link"],
  },
  {
    slug: "email-test",
    name: "Testmail",
    description: "Vorlage für Test-E-Mails aus dem Admin.",
    subject: "Test-E-Mail — {{company_name}}",
    body_html: "",
    body_text: "Dies ist eine Test-E-Mail von {{company_name}}.\n\nWenn Sie diese Nachricht erhalten, funktioniert der Versand.",
    layout: {
      headline: "Test-E-Mail",
      intro: "Dies ist eine Test-E-Mail von {{company_name}}.",
      body: "Absender: {{sender_from}}\nReply-To: {{reply_to}}\nDomain: {{domain_status}}\n\nLogo: geladen ✓\n\nWenn Sie diese Nachricht erhalten, funktioniert der Versand.",
      footerEnabled: true,
    },
    area: "general",
    is_active: true,
    is_default: false,
    variables: ["company_name", "sender_from", "reply_to", "domain_status"],
  },
  {
    slug: "admin-invite",
    name: "Admin-Einladung",
    description: "Einladungslink für neue Admin-Benutzer.",
    subject: "Einladung zum Panda-Bande Admin",
    body_html: "",
    body_text: `Hallo {{admin_name}},

Sie wurden als {{role_label}} zum Panda-Bande Admin eingeladen.

{{message}}

Der Link ist einmalig und läuft in 48 Stunden ab. Es wird kein Passwort per E-Mail versendet.`,
    layout: {
      headline: "Einladung zum Panda-Bande Admin",
      intro: "Hallo {{admin_name}},",
      body: "Sie wurden als {{role_label}} eingeladen.\n\n{{message}}\n\nDer Link ist einmalig und läuft in 48 Stunden ab. Es wird kein Passwort per E-Mail versendet.",
      ctaText: "Zugang einrichten",
      ctaUrl: "{{invite_link}}",
      footerEnabled: true,
    },
    area: "security",
    is_active: true,
    is_default: true,
    variables: ["company_name", "admin_name", "role_label", "invite_link", "message"],
  },
  {
    slug: "account-created",
    name: "Account erstellt",
    description: "Willkommens-E-Mail bei neuem Admin-Account.",
    subject: "Ihr Zugang bei {{company_name}}",
    body_html: "",
    body_text: "Hallo {{admin_name}},\n\nIhr Admin-Zugang wurde eingerichtet.\n\n{{message}}",
    layout: {
      headline: "Willkommen im Admin-Bereich",
      intro: "Hallo {{admin_name}},",
      body: "Ihr Zugang bei {{company_name}} wurde eingerichtet.\n\nSie können sich ab sofort im Admin-Bereich anmelden.",
      ctaText: "Zum Admin-Bereich",
      ctaUrl: "{{admin_url}}",
      footerEnabled: true,
    },
    area: "security",
    is_active: true,
    is_default: true,
    variables: ["company_name", "admin_name", "admin_url", "message"],
  },
  {
    slug: "newsletter-draft",
    name: "Newsletter (Vorbereitung)",
    description: "Grundgerüst für zukünftige Newsletter-Kampagnen.",
    subject: "Neuigkeiten von {{company_name}}",
    body_html: "",
    body_text: "Hallo {{customer_name}},\n\n{{message}}",
    layout: {
      headline: "Neuigkeiten von {{company_name}}",
      intro: "Hallo {{customer_name}},",
      body: "{{message}}",
      ctaText: "Mehr erfahren",
      ctaUrl: "{{website}}",
      footerEnabled: true,
    },
    area: "newsletter",
    is_active: false,
    is_default: true,
    variables: ["company_name", "customer_name", "message", "website"],
  },
  {
    slug: "security-login",
    name: "Login/Security Hinweis",
    description: "Optionaler Hinweis bei Admin-Anmeldungen.",
    subject: "Sicherheitshinweis — {{company_name}}",
    body_html: "",
    body_text: "Es gab eine Anmeldung in Ihrem Admin-Konto.",
    layout: {
      headline: "Sicherheitshinweis",
      body: "Es gab eine Anmeldung in Ihrem Admin-Konto.",
      footerEnabled: false,
    },
    area: "security",
    is_active: true,
    is_default: true,
    variables: ["company_name", "admin_name"],
  },
];

function parseLayoutJson(raw: unknown): EmailTemplateLayout | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as EmailTemplateLayout;
}

function mapRow(row: Record<string, unknown>): EmailTemplateRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: row.description != null ? String(row.description) : null,
    subject: String(row.subject ?? ""),
    body_html: String(row.body_html ?? ""),
    body_text: row.body_text != null ? String(row.body_text) : null,
    layout: parseLayoutJson(row.layout_json),
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
    description: template.description ?? null,
    subject: template.subject ?? "",
    body_html: template.body_html ?? "",
    body_text: template.body_text ?? null,
    layout_json: template.layout ?? null,
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

export function getDefaultTemplateBySlug(slug: string): DefaultTemplate | null {
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
    description: defaults.description,
    subject: defaults.subject,
    body_html: defaults.body_html,
    body_text: defaults.body_text,
    layout: defaults.layout,
    area: defaults.area,
    is_active: defaults.is_active,
    is_default: defaults.is_default,
    variables: defaults.variables,
  });
}
