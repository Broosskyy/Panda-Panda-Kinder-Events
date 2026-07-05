"use client";

import { CookieBanner } from "@/components/layout/CookieBanner";
import { FloatingContactButtons } from "@/components/layout/FloatingContactButtons";
import { StickyCtaBar } from "@/components/layout/StickyCtaBar";
import type { SiteContactSettings } from "@/lib/cms/types";

interface PublicChromeProps {
  contact: SiteContactSettings;
}

export function PublicChrome({ contact }: PublicChromeProps) {
  return (
    <>
      <FloatingContactButtons contact={contact} />
      <StickyCtaBar />
      <CookieBanner />
    </>
  );
}
