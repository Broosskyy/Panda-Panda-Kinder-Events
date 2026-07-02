import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="bg-primary text-text-inverse">
      <Container className="py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Logo variant="inverse" />
            <p className="font-accent mt-4 text-lg text-white/90">
              Mit Herz für kleine Abenteurer. ♡
            </p>
          </div>

          <div className="text-center md:text-left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              Kontakt
            </p>
            <ul className="space-y-3 text-base">
              <li>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <Instagram className="h-4 w-4" />
                  {siteConfig.contact.instagramHandle}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <Mail className="h-4 w-4" />
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-white/90">
                <MapPin className="h-4 w-4" />
                {siteConfig.contact.location}
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              Rechtliches
            </p>
            <nav className="flex flex-col gap-3 text-base" aria-label="Rechtliches">
              <a href="/impressum" className="transition-opacity hover:opacity-80">
                Impressum
              </a>
              <a href="/datenschutz" className="transition-opacity hover:opacity-80">
                Datenschutz
              </a>
              <a href="/agb" className="transition-opacity hover:opacity-80">
                AGB
              </a>
            </nav>
            <div className="mt-6 flex items-center justify-center gap-3 md:justify-end">
              <a
                href={siteConfig.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-white/15 pt-8 text-center text-base text-white/80">
          © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
        </p>
      </Container>
    </footer>
  );
}
