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
      <Container className="relative py-12 sm:py-16 md:py-20">
        <div className="grid gap-12 sm:gap-14 md:grid-cols-2 lg:grid-cols-4 md:gap-10">
          <div className="flex flex-col items-center md:items-start lg:col-span-1">
            <Logo context="footer" variant="inverse" branding={branding} />
            <p className="font-accent mt-5 max-w-xs text-center text-lg leading-snug text-white/90 sm:mt-6 sm:text-xl md:max-w-none md:text-left md:text-2xl">
              {footer.tagline}
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Navigation</p>
            <nav className="flex flex-col gap-3 text-base" aria-label="Footer Navigation">
              {FOOTER_NAV.map((item) => (
                <a key={item.href} href={item.href} className="transition-opacity duration-300 hover:opacity-85">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="text-center md:text-left">
            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Kontakt</p>
            <ul className="space-y-4 text-base">
              {phone ? (
              <li>
                <a
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <Phone className="h-5 w-5" strokeWidth={ICON_STROKE} />
                  {phone}
                </a>
              </li>
              ) : null}
              {email ? (
              <li>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <Mail className="h-5 w-5" strokeWidth={ICON_STROKE} />
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
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <MessageCircle className="h-5 w-5" strokeWidth={ICON_STROKE} />
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
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <Instagram className="h-5 w-5" strokeWidth={ICON_STROKE} />
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
                    className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
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
                  className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-85"
                >
                  <MapPin className="h-5 w-5" strokeWidth={ICON_STROKE} />
                  {location}
                </a>
              </li>
              ) : null}
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
              <CookieSettingsButton />
            </nav>
            <div className="mt-10 flex items-center justify-center gap-4 md:justify-end">
              <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="Instagram">
                <Instagram className="h-5 w-5" strokeWidth={ICON_STROKE} />
              </a>
              <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-pill" aria-label="WhatsApp">
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
