import { MessageCircle, Phone } from "lucide-react";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteContactSettings } from "@/lib/cms/types";

interface FloatingContactButtonsProps {
  contact?: SiteContactSettings;
}

export function FloatingContactButtons({
  contact = DEFAULT_SITE_SETTINGS.contact,
}: FloatingContactButtonsProps) {
  const phoneHref = `tel:${contact.phone.replace(/\s/g, "")}`;

  return (
    <div className="floating-contact-stack" aria-label="Schnellkontakt">
      <a
        href={phoneHref}
        className="floating-contact-btn floating-contact-btn-phone"
        aria-label="Anrufen"
      >
        <Phone className="h-6 w-6" aria-hidden />
      </a>
      <a
        href={`https://wa.me/${contact.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-contact-btn floating-contact-btn-whatsapp"
        aria-label="WhatsApp Chat öffnen"
      >
        <MessageCircle className="h-6 w-6" aria-hidden />
      </a>
    </div>
  );
}
