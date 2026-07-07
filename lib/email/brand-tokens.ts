/** System-wide email defaults when CMS branding fields are empty (tenant-agnostic) */
export const SYSTEM_EMAIL_DEFAULTS = {
  pageBackground: "#F8F6F1",
  cardBackground: "#FFFFFF",
  primary: "#4F5638",
  text: "#2E2E2A",
  textMuted: "#6F6F66",
  border: "#E6E1D8",
  accent: "#F1EEE7",
  buttonText: "#FFFFFF",
  fontFamily: "Helvetica, Arial, sans-serif",
  logoWidth: 180,
} as const;

/** @deprecated Use SYSTEM_EMAIL_DEFAULTS */
export const EMAIL_BRAND = {
  pageBackground: SYSTEM_EMAIL_DEFAULTS.pageBackground,
  cardBackground: SYSTEM_EMAIL_DEFAULTS.cardBackground,
  primary: SYSTEM_EMAIL_DEFAULTS.primary,
  text: SYSTEM_EMAIL_DEFAULTS.text,
  textMuted: SYSTEM_EMAIL_DEFAULTS.textMuted,
  border: SYSTEM_EMAIL_DEFAULTS.border,
  accent: SYSTEM_EMAIL_DEFAULTS.accent,
  buttonText: SYSTEM_EMAIL_DEFAULTS.buttonText,
} as const;
