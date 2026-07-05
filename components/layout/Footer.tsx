import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SiteContactSettings, SiteFooterSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { ICON_STROKE } from "@/lib/design";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

interface FooterProps {
  contact?: SiteContactSettings;
  footer?: SiteFooterSettings;
}

export function Footer({
  contact = DEFAULT_SITE_SETTINGS.contact,
  footer = DEFAULT_SITE_SETTINGS.footer,
}: FooterProps) {
  return (
    <footer className="footer-premium text-text-inverse">
      <Container className="relative py-12 sm:py-16 md:py-20">
        <div className="grid gap-12 sm:gap-14 md:grid-cols-[1.2fr_1fr_1fr] md:gap-12">
          <div className="flex flex-col items-center md:items-start">
            <Logo variant="inverse" size="large" className="md:[&_img]:max-h-14" />
            <p className="font-accent mt-5 max-w-xs text-center text-lg leading-snug text-white/90 sm:mt-6 sm:text-xl md:max-w-none md:text-left md:text-2xl">
              {footer.tagline}
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Kontakt</p>
            <ul className="space-y-4 text-base">
              <li>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <Phone className="h-5 w-5" strokeWidth={ICON_STROKE} />
                  {contact.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <MessageCircle className="h-5 w-5" strokeWidth={ICON_STROKE} />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <Instagram className="h-5 w-5" strokeWidth={ICON_STROKE} />
                  {contact.instagramHandle}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <Mail className="h-5 w-5" strokeWidth={ICON_STROKE} />
                  {contact.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-white/85">
                <MapPin className="h-5 w-5" strokeWidth={ICON_STROKE} />
                {contact.location}
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Rechtliches</p>
            <nav className="flex flex-col gap-4 text-base" aria-label="Rechtliches">
              <a href="/impressum" className="transition-opacity duration-300 hover:opacity-85">
                Impressum
              </a>
              <a href="/datenschutz" className="transition-opacity duration-300 hover:opacity-85">
                Datenschutz
              </a>
              <a href="/agb" className="transition-opacity duration-300 hover:opacity-85">
                AGB
              </a>
            </nav>
            <div className="mt-10 flex items-center justify-center gap-4 md:justify-end">
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="social-pill"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" strokeWidth={ICON_STROKE} />
              </a>
              <a
                href={`https://wa.me/${contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-pill"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" strokeWidth={ICON_STROKE} />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-white/10 pt-7 text-center text-sm text-white/70 sm:mt-16 sm:pt-8 sm:text-base">
          © {new Date().getFullYear()} {footer.copyrightName}. Alle Rechte vorbehalten.
        </p>
      </Container>
    </footer>
  );
}
