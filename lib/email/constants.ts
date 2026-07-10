/**
 * E-Mail-Fallback-Konstanten — abgeleitet aus lib/system-config.ts
 * @see lib/system-config.ts für die zentrale Konfiguration
 */
import {
  getDefaultCompanyDomain,
  getDefaultCompanyEmail,
  getDefaultFromAddress,
  getDefaultSenderName,
} from "@/lib/system-config";

/** Einzige erlaubte feste Fallback-Adresse für Produktion */
export const DEFAULT_COMPANY_EMAIL = getDefaultCompanyEmail();

export const DEFAULT_COMPANY_DOMAIN = getDefaultCompanyDomain();

/** Standard-Absendername für alle ausgehenden E-Mails */
export const DEFAULT_SENDER_NAME = getDefaultSenderName();

/** Produktions-Absender im Format für Resend */
export const DEFAULT_FROM_ADDRESS = getDefaultFromAddress();
