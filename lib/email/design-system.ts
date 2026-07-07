import type { ResolvedEmailBranding } from "@/lib/email/branding";
import { SYSTEM_EMAIL_DEFAULTS } from "@/lib/email/brand-tokens";

export type EmailThemeMode = "light" | "dark" | "auto";

/** Resolved design tokens — single source for all email HTML output */
export interface EmailDesignTokens {
  pageBackground: string;
  cardBackground: string;
  primary: string;
  secondary: string;
  accent: string;
  button: string;
  buttonText: string;
  text: string;
  textMuted: string;
  border: string;
  link: string;
  fontFamily: string;
  theme: EmailThemeMode;
}

const DARK_THEME_OVERRIDES: Partial<EmailDesignTokens> = {
  pageBackground: "#1a1a18",
  cardBackground: "#2a2a26",
  text: "#f4f1ea",
  textMuted: "#b8b5ad",
  accent: "#33332f",
  border: "#3d3d38",
};

export function resolveDesignTokens(branding: Partial<ResolvedEmailBranding>): EmailDesignTokens {
  const theme = branding.theme ?? "light";
  const light: EmailDesignTokens = {
    pageBackground: branding.backgroundColor || SYSTEM_EMAIL_DEFAULTS.pageBackground,
    cardBackground: branding.cardBackground || SYSTEM_EMAIL_DEFAULTS.cardBackground,
    primary: branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    secondary: branding.secondaryColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    accent: branding.accentColor || branding.footerColor || SYSTEM_EMAIL_DEFAULTS.accent,
    button: branding.buttonColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    buttonText: branding.buttonTextColor || SYSTEM_EMAIL_DEFAULTS.buttonText,
    text: branding.textColor || SYSTEM_EMAIL_DEFAULTS.text,
    textMuted: branding.textMutedColor || SYSTEM_EMAIL_DEFAULTS.textMuted,
    border: branding.borderColor || SYSTEM_EMAIL_DEFAULTS.border,
    link: branding.linkColor || branding.primaryColor || SYSTEM_EMAIL_DEFAULTS.primary,
    fontFamily: branding.fontFamily || SYSTEM_EMAIL_DEFAULTS.fontFamily,
    theme,
  };

  if (theme !== "dark") return light;

  return {
    ...light,
    ...DARK_THEME_OVERRIDES,
    primary: branding.primaryColor || light.primary,
    button: branding.buttonColor || light.button,
    link: branding.linkColor || branding.primaryColor || light.link,
  };
}

/** Auto theme: light only in output (dark prep for future client detection) */
export function resolveActiveDesignTokens(branding: Partial<ResolvedEmailBranding>): EmailDesignTokens {
  if (branding.theme === "dark") return resolveDesignTokens({ ...branding, theme: "dark" });
  return resolveDesignTokens({ ...branding, theme: "light" });
}
