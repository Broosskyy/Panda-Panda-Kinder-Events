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
  return result;
}

export interface EmailVariableHint {
  key: string;
  label: string;
}

/** Verständliche Platzhalter-Hilfe für den Admin */
export const EMAIL_VARIABLE_HINTS: EmailVariableHint[] = [
  { key: "customer_name", label: "Name des Kunden" },
  { key: "name", label: "Name des Kunden (Kurzform)" },
  { key: "customer_email", label: "E-Mail des Kunden" },
  { key: "customer_phone", label: "Telefon des Kunden" },
  { key: "event_type", label: "Art der Veranstaltung" },
  { key: "event_date", label: "Datum der Veranstaltung" },
  { key: "children_count", label: "Anzahl der Kinder" },
  { key: "message", label: "Nachricht des Kunden" },
  { key: "quote_number", label: "Angebotsnummer" },
  { key: "invoice_number", label: "Rechnungsnummer" },
  { key: "total_amount", label: "Gesamtbetrag" },
  { key: "due_date", label: "Fälligkeitsdatum" },
  { key: "review_link", label: "Link zur Bewertung" },
  { key: "reset_link", label: "Link zum Passwort zurücksetzen" },
  { key: "rating", label: "Sternebewertung (1–5)" },
  { key: "company_name", label: "Firmenname" },
  { key: "company_email", label: "Firmen-E-Mail" },
  { key: "company_phone", label: "Telefonnummer" },
  { key: "company_website", label: "Website-Link" },
  { key: "admin_name", label: "Name des Admin-Benutzers" },
  { key: "submitted_at", label: "Eingangsdatum und -uhrzeit" },
];

export const EMAIL_VARIABLE_HINT_KEYS = EMAIL_VARIABLE_HINTS.map((h) => h.key);
