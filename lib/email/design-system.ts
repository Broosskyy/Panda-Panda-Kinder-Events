import type { ResolvedEmailBranding } from "@/lib/email/branding";
import { SYSTEM_EMAIL_DEFAULTS } from "@/lib/email/brand-tokens";
import type { EmailThemeMode } from "@/lib/cms/types";

export type { EmailThemeMode };

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
  cardRadius: string;
  cardShadow: string;
}

function shadowCss(enabled: boolean): string {
  return enabled
    ? "0 4px 24px rgba(47,47,47,0.06)"
    : "none";
}

export function resolveDesignTokens(branding: Partial<ResolvedEmailBranding>): EmailDesignTokens {
  const theme = branding.theme ?? "light";
  const radius = `${branding.cardRadius ?? 16}px`;
  const shadowOn = branding.shadowEnabled !== false;

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
    cardRadius: radius,
    cardShadow: shadowCss(shadowOn),
  };

  if (theme !== "dark") return light;

  return {
    ...light,
    pageBackground: branding.darkBackgroundColor || "#1a1a18",
    cardBackground: branding.darkCardColor || "#2a2a26",
    primary: branding.darkPrimaryColor || branding.primaryColor || light.primary,
    secondary: branding.darkSecondaryColor || branding.darkPrimaryColor || light.secondary,
    text: branding.darkTextColor || "#f4f1ea",
    textMuted: branding.darkTextMutedColor || "#b8b5ad",
    border: branding.darkBorderColor || "#3d3d38",
    accent: branding.darkAccentColor || "#33332f",
    button: branding.darkButtonColor || branding.darkPrimaryColor || light.button,
    buttonText: branding.darkButtonTextColor || "#ffffff",
    link: branding.darkPrimaryColor || branding.linkColor || light.link,
    theme: "dark",
  };
}

/** Resolves tokens for output — dark preview forces dark inline styles */
export function resolveActiveDesignTokens(
  branding: Partial<ResolvedEmailBranding>,
  forceTheme?: EmailThemeMode,
): EmailDesignTokens {
  const theme = forceTheme ?? branding.theme ?? "light";
  if (theme === "dark") return resolveDesignTokens({ ...branding, theme: "dark" });
  return resolveDesignTokens({ ...branding, theme: theme === "auto" ? "auto" : "light" });
}
