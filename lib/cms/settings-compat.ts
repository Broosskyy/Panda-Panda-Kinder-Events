import type { SiteBankSettings, SiteBusinessSettings, SiteInvoiceSettings } from "./types";

/** Maps legacy business bank/tax fields into bank section when bank is empty. */
export function mergeBankFromLegacy(business: SiteBusinessSettings, bank: SiteBankSettings): SiteBankSettings {
  return {
    ...bank,
    bankName: bank.bankName || business.bankName,
    accountHolder: bank.accountHolder || business.companyName,
    iban: bank.iban || business.iban,
    bic: bank.bic || business.bic,
    taxNumber: bank.taxNumber || business.taxNumber,
    vatId: bank.vatId || business.vatId,
  };
}

/** Maps legacy business invoice texts into invoice section when empty. */
export function mergeInvoiceFromLegacy(
  business: SiteBusinessSettings,
  invoice: SiteInvoiceSettings,
): SiteInvoiceSettings {
  return {
    ...invoice,
    defaultPaymentDays: invoice.defaultPaymentDays || business.defaultPaymentDays || 14,
    quoteIntroText: invoice.quoteIntroText || business.defaultQuoteText,
    invoiceIntroText: invoice.invoiceIntroText || business.defaultInvoiceText,
    paymentInfoText: invoice.paymentInfoText || business.defaultPaymentText,
  };
}

/** Sync deprecated business fields from canonical bank/invoice for backward compat. */
export function syncLegacyBusinessFields(
  business: SiteBusinessSettings,
  bank: SiteBankSettings,
  invoice: SiteInvoiceSettings,
): SiteBusinessSettings {
  return {
    ...business,
    iban: bank.iban,
    bic: bank.bic,
    bankName: bank.bankName,
    taxNumber: bank.taxNumber,
    vatId: bank.vatId,
    defaultPaymentDays: invoice.defaultPaymentDays,
    defaultQuoteText: invoice.quoteIntroText,
    defaultInvoiceText: invoice.invoiceIntroText,
    defaultPaymentText: invoice.paymentInfoText,
  };
}

export type ControlCenterSection =
  | "business"
  | "branding"
  | "contact"
  | "email"
  | "invoice"
  | "bank"
  | "seo"
  | "legal";

export type ControlCenterTab = ControlCenterSection | "system" | "modules" | "help";

export const CONTROL_CENTER_TABS: {
  id: ControlCenterTab;
  label: string;
  auditArea: string;
}[] = [
  { id: "business", label: "Unternehmensdaten", auditArea: "settings_business" },
  { id: "branding", label: "Branding", auditArea: "settings_branding" },
  { id: "contact", label: "Kontakt & Social Media", auditArea: "settings_contact" },
  { id: "email", label: "E-Mail & Versand", auditArea: "settings_email" },
  { id: "invoice", label: "Rechnungen & Angebote", auditArea: "settings_invoice" },
  { id: "bank", label: "Bank & Steuerdaten", auditArea: "settings_bank" },
  { id: "seo", label: "Domain & SEO", auditArea: "settings_seo" },
  { id: "legal", label: "Rechtliches", auditArea: "settings_legal" },
  { id: "modules", label: "Module", auditArea: "settings_modules" },
  { id: "system", label: "Systemstatus", auditArea: "settings_system" },
  { id: "help", label: "Hilfe", auditArea: "settings_help" },
];
