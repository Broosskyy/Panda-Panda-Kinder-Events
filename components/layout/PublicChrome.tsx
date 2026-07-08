"use client";

import { CookieBanner } from "@/components/layout/CookieBanner";
import { FloatingContactButtons } from "@/components/layout/FloatingContactButtons";
import { StickyCtaBar } from "@/components/layout/StickyCtaBar";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { isModuleEnabled } from "@/lib/cms/modules";
import type { SiteContactSettings, SiteFooterSettings, SiteModulesSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";

interface PublicChromeProps {
  contact: SiteContactSettings;
  ctaLabel?: string;
  cookieNoticeText?: string;
  footer?: SiteFooterSettings;
  modules?: SiteModulesSettings;
}

export function PublicChrome({
  contact,
  ctaLabel,
  cookieNoticeText,
  footer,
  modules = DEFAULT_SITE_SETTINGS.modules,
}: PublicChromeProps) {
  const showWhatsapp = isModuleEnabled(modules, "whatsapp");
  const showSticky = isModuleEnabled(modules, "stickyCta");

  return (
    <>
      <SplashScreen tagline={footer?.tagline} />
      {showWhatsapp ? <FloatingContactButtons contact={contact} /> : null}
      {showSticky ? (
        <StickyCtaBar
          label={ctaLabel || "Unverbindlich anfragen"}
          sublabel="Bereit für euer Event? Wir melden uns persönlich."
        />
      ) : null}
      <CookieBanner noticeText={cookieNoticeText} />
    </>
  );
}
