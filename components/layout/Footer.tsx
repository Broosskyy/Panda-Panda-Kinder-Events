import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SiteBrandingSettings, SiteContactSettings, SiteFooterSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { ICON_STROKE } from "@/lib/design";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { CookieSettingsButton } from "@/components/layout/CookieSettingsButton";

interface FooterProps {
  contact?: SiteContactSettings;
  footer?: SiteFooterSettings;
  branding?: SiteBrandingSettings;
}

const FOOTER_NAV = [
  { label: "Leistungen", href: "#leistungen" },
  { label: "Über uns", href: "#ueber-uns" },
  { label: "Galerie", href: "#galerie" },
  { label: "Bewertungen", href: "#bewertungen" },
  { label: "FAQ", href: "#faq" },
  { label: "Aktuelles", href: "/aktuelles" },
  { label: "Kontakt", href: "#kontakt" },
] as const;

export function Footer({
  contact = DEFAULT_SITE_SETTINGS.contact,
  footer = DEFAULT_SITE_SETTINGS.footer,
  branding = DEFAULT_SITE_SETTINGS.branding,
}: FooterProps) {
  const mapsHref = contact.mapsUrl?.trim() || `https://maps.google.com/?q=${encodeURIComponent(contact.location)}`;
  const phone = contact.phone?.trim() ?? "";
  const email = contact.email?.trim() ?? "";
  const whatsapp = contact.whatsapp?.trim() ?? "";
  const instagram = contact.instagram?.trim() ?? "";
  const instagramHandle = contact.instagramHandle?.trim() ?? "";
  const location = contact.location?.trim() ?? "";

  return (
    <footer className="footer-premium text-text-inverse">
      <Container className="footer-inner relative py-3 sm:py-16 md:py-20">
        <div className="footer-grid grid gap-4 sm:gap-14 md:grid-cols-2 lg:grid-cols-4 md:gap-10">
          <div className="flex flex-col items-center md:items-start lg:col-span-1">
            <Logo context="footer" variant="inverse" branding={branding} className="footer-brand-mark" />
            <p className="footer-tagline font-accent mt-3 max-w-xs text-center text-base leading-snug text-white/90 sm:mt-6 sm:text-xl md:max-w-none md:text-left md:text-2xl">
              {footer.tagline}
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="footer-col-title mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 sm:mb-6">Navigation</p>
            <nav className="footer-nav flex flex-col gap-2 text-sm sm:gap-3 sm:text-base" aria-label="Footer Navigation">
              {FOOTER_NAV.map((item) => (
                <a key={item.href} href={item.href} className="transition-opacity duration-300 hover:opacity-85">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="text-center md:text-left">
            <p className="footer-col-title mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 sm:mb-6">Kontakt</p>
            <ul className="footer-contact-list space-y-2.5 text-sm sm:space-y-4 sm:text-base">
              {phone ? (
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-85 sm:gap-3"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={ICON_STROKE} />
                  {phone}
                </a>
              </li>
              ) : null}
              {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-85 sm:gap-3"
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={ICON_STROKE} />
                  {email}
                </a>
              </li>
              ) : null}
              {whatsapp ? (
              <li>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-85 sm:gap-3"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={ICON_STROKE} />
                  WhatsApp
                </a>
              </li>
              ) : null}
              {instagram ? (
              <li>
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-85 sm:gap-3"
                >
                  <Instagram className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={ICON_STROKE} />
                  {instagramHandle || "Instagram"}
                </a>
              </li>
              ) : null}
              {contact.facebook ? (
                <li>
                  <a
                    href={contact.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-85 sm:gap-3"
                  >
                    Facebook
                  </a>
                </li>
              ) : null}
              {location ? (
              <li>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-85 sm:gap-3"
                >
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={ICON_STROKE} />
                  {location}
                </a>
              </li>
              ) : null}
            </ul>
          </div>

          <div className="text-center md:text-right">
            <p className="footer-col-title mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 sm:mb-6">Rechtliches</p>
            <nav className="footer-nav flex flex-col gap-2 text-sm sm:gap-4 sm:text-base" aria-label="Rechtliches">
              <a href="/impressum" className="transition-opacity duration-300 hover:opacity-85">
                Impressum
              </a>
              <a href="/datenschutz" className="transition-opacity duration-300 hover:opacity-85">
                Datenschutz
              </a>
              <a href="/agb" className="transition-opacity duration-300 hover:opacity-85">
                AGB
              </a>
              <CookieSettingsButton />
            </nav>
            <div className="footer-social mt-4 flex items-center justify-center gap-3 sm:mt-10 md:justify-end">
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="Instagram">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={ICON_STROKE} />
              </a>
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="WhatsApp">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={ICON_STROKE} />
              </a>
            </div>
          </div>
        </div>

        <p className="footer-copyright mt-4 border-t border-white/10 pt-3 text-center text-xs text-white/70 sm:mt-16 sm:pt-8 sm:text-base">
          © {new Date().getFullYear()} {footer.copyrightName}. Alle Rechte vorbehalten.
        </p>
      </Container>
    </footer>
  );
}
