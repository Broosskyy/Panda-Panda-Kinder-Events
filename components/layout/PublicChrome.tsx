"use client";

import { CookieBanner } from "@/components/layout/CookieBanner";
import { FloatingContactButtons } from "@/components/layout/FloatingContactButtons";
import { StickyCtaBar } from "@/components/layout/StickyCtaBar";
import type { SiteContactSettings } from "@/lib/cms/types";

interface PublicChromeProps {
  contact: SiteContactSettings;
  ctaLabel?: string;
}

export function PublicChrome({ contact, ctaLabel }: PublicChromeProps) {
  return (
    <>
      <FloatingContactButtons contact={contact} />
      <StickyCtaBar label={ctaLabel} />
      <CookieBanner />
    </>
  );
}
