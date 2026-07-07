/** Ersetzt {{variable}} und {variable} — fehlende Werte werden leer gelassen */
export function applyTemplateVariables(
  template: string,
  vars: Record<string, string | number | null | undefined>,
): string {
  let result = template;
  for (const [key, raw] of Object.entries(vars)) {
    const value = raw == null ? "" : String(raw);
    result = result.replaceAll(`{{${key}}}`, value);
    result = result.replaceAll(`{${key}}`, value);
  }
  // Remove unresolved placeholders silently
  result = result.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "");
  result = result.replace(/\{[a-zA-Z0-9_]+\}/g, "");
  return result;
}

export interface EmailVariableHint {
  key: string;
  label: string;
  aliases?: string[];
}

/** Platzhalter-Hilfe für den Admin — white-label neutral */
export const EMAIL_VARIABLE_HINTS: EmailVariableHint[] = [
  { key: "customer_name", label: "Name des Kunden", aliases: ["name"] },
  { key: "name", label: "Vorname / Kurzname" },
  { key: "customer_email", label: "E-Mail des Kunden", aliases: ["email"] },
  { key: "email", label: "E-Mail-Adresse" },
  { key: "customer_phone", label: "Telefon des Kunden", aliases: ["phone"] },
  { key: "phone", label: "Telefonnummer" },
  { key: "event_type", label: "Art der Veranstaltung", aliases: ["eventType"] },
  { key: "event_date", label: "Datum der Veranstaltung", aliases: ["eventDate"] },
  { key: "children_count", label: "Anzahl der Kinder" },
  { key: "message", label: "Nachricht des Kunden" },
  { key: "reviewText", label: "Bewertungstext", aliases: ["message"] },
  { key: "quote_number", label: "Angebotsnummer", aliases: ["offerNumber"] },
  { key: "offerNumber", label: "Angebotsnummer" },
  { key: "invoice_number", label: "Rechnungsnummer", aliases: ["invoiceNumber"] },
  { key: "invoiceNumber", label: "Rechnungsnummer" },
  { key: "total_amount", label: "Gesamtbetrag", aliases: ["amount"] },
  { key: "amount", label: "Betrag" },
  { key: "due_date", label: "Fälligkeitsdatum" },
  { key: "review_link", label: "Link zur Bewertung" },
  { key: "reset_link", label: "Link zum Passwort zurücksetzen" },
  { key: "admin_url", label: "Link zum Admin-Bereich", aliases: ["adminUrl"] },
  { key: "adminUrl", label: "Admin-Link" },
  { key: "rating", label: "Sternebewertung (1–5)" },
  { key: "company_name", label: "Firmenname", aliases: ["company"] },
  { key: "company", label: "Firma" },
  { key: "company_email", label: "Firmen-E-Mail" },
  { key: "company_phone", label: "Firmen-Telefon" },
  { key: "company_website", label: "Website", aliases: ["website", "websiteUrl"] },
  { key: "website", label: "Website-URL" },
  { key: "websiteUrl", label: "Website-URL" },
  { key: "opening_hours", label: "Öffnungszeiten" },
  { key: "current_year", label: "Aktuelles Jahr", aliases: ["currentYear"] },
  { key: "currentYear", label: "Aktuelles Jahr" },
  { key: "admin_name", label: "Name des Admin-Benutzers" },
  { key: "submitted_at", label: "Eingangsdatum und -uhrzeit" },
  { key: "logo_url", label: "Logo-URL (absolut)" },
  { key: "primary_color", label: "Primärfarbe (Hex)" },
];

export const EMAIL_VARIABLE_HINT_KEYS = EMAIL_VARIABLE_HINTS.map((h) => h.key);

/** Normalize variable aliases into canonical context */
export function normalizeEmailVariables(vars: Record<string, string>): Record<string, string> {
  const out = { ...vars };
  const aliasMap: Record<string, string> = {
    name: "customer_name",
    email: "customer_email",
    phone: "customer_phone",
    eventType: "event_type",
    eventDate: "event_date",
    offerNumber: "quote_number",
    invoiceNumber: "invoice_number",
    amount: "total_amount",
    company: "company_name",
    websiteUrl: "company_website",
    website: "company_website",
    adminUrl: "admin_url",
    reviewText: "message",
    currentYear: "current_year",
  };

  for (const [alias, canonical] of Object.entries(aliasMap)) {
    if (out[alias]?.trim() && !out[canonical]?.trim()) out[canonical] = out[alias];
    if (out[canonical]?.trim() && !out[alias]?.trim()) out[alias] = out[canonical];
  }

  if (!out.current_year) out.current_year = String(new Date().getFullYear());
  if (!out.currentYear) out.currentYear = out.current_year;

  return out;
}
