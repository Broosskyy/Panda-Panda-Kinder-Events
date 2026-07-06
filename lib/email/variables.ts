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

export const EMAIL_VARIABLE_HINTS = [
  "company_name",
  "company_email",
  "company_phone",
  "company_website",
  "customer_name",
  "customer_email",
  "quote_number",
  "invoice_number",
  "total_amount",
  "due_date",
  "payment_terms",
  "iban",
  "bic",
  "appointment_date",
  "message",
  "admin_name",
] as const;
