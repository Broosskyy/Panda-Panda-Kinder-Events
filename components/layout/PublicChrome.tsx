"use client";

import { CookieBanner } from "@/components/layout/CookieBanner";
import { FloatingContactButtons } from "@/components/layout/FloatingContactButtons";
import { StickyCtaBar } from "@/components/layout/StickyCtaBar";
import { SplashScreen } from "@/components/ui/SplashScreen";
import type { SiteContactSettings, SiteFooterSettings } from "@/lib/cms/types";

interface PublicChromeProps {
  contact: SiteContactSettings;
  ctaLabel?: string;
  cookieNoticeText?: string;
  footer?: SiteFooterSettings;
}

export function PublicChrome({ contact, ctaLabel, cookieNoticeText, footer }: PublicChromeProps) {
  return (
    <>
      <SplashScreen tagline={footer?.tagline} />
      <FloatingContactButtons contact={contact} />
      <StickyCtaBar label={ctaLabel} />
      <CookieBanner noticeText={cookieNoticeText} />
    </>
  );
}
