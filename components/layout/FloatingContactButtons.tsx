"use client";

import { MessageCircle } from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteContactSettings } from "@/lib/cms/types";
import { useHideNearFormSections } from "@/lib/hooks/useHideNearFormSections";

interface FloatingContactButtonsProps {
  contact?: SiteContactSettings;
}

/** WhatsApp only — phone remains in contact section and footer. */
export function FloatingContactButtons({
  contact = DEFAULT_SITE_SETTINGS.contact,
}: FloatingContactButtonsProps) {
  const hidden = useHideNearFormSections();

  return (
    <div
      className={`floating-contact-stack${hidden ? " is-hidden" : ""}`}
      aria-label="WhatsApp Schnellkontakt"
      aria-hidden={hidden}
    >
      <a
        href={`https://wa.me/${contact.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-contact-btn floating-contact-btn-whatsapp"
        aria-label="WhatsApp Chat öffnen"
        tabIndex={hidden ? -1 : undefined}
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
      </a>
    </div>
  );
}
