/** System-wide email defaults when CMS branding fields are empty (tenant-agnostic) */
export const SYSTEM_EMAIL_DEFAULTS = {
  pageBackground: "#F7F3EA",
  cardBackground: "#FFFFFF",
  primary: "#6B7A3A",
  text: "#2F2F2F",
  textMuted: "#6B6B6B",
  border: "#E8E2D6",
  accent: "#F4F6EE",
  buttonText: "#FFFFFF",
  fontFamily: "Helvetica, Arial, sans-serif",
  logoWidth: 140,
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
