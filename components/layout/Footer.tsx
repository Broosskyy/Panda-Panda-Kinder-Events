import { Instagram, Mail, MapPin, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";
import { PandaMascot } from "@/components/ui/PandaMascot";

export function Footer() {
  return (
    <footer className="footer-premium text-text-inverse">
      <Container className="py-10 sm:py-14 md:py-20">
        <div className="grid gap-10 sm:gap-12 md:grid-cols-[1.2fr_1fr_1fr] md:gap-10">
          <div className="flex flex-col items-center md:items-start">
            <Logo variant="inverse" size="large" className="md:hidden" />
            <Logo variant="inverse" size="xl" className="hidden md:block" />
            <p className="font-accent mt-4 text-lg text-white/90 sm:mt-5 sm:text-xl md:text-2xl">
              Mit Herz für kleine Abenteurer. ♡
            </p>
            <PandaMascot size={56} className="mt-4 opacity-80 sm:mt-6 sm:hidden" />
            <PandaMascot size={72} className="mt-6 hidden opacity-80 sm:block" />
          </div>

          <div className="text-center md:text-left">
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-white/70">
              Kontakt
            </p>
            <ul className="space-y-4 text-base">
              <li>
                <a
                  href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <Instagram className="h-5 w-5" />
                  {siteConfig.contact.instagramHandle}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="inline-flex items-center gap-3 transition-opacity hover:opacity-80"
                >
                  <Mail className="h-5 w-5" />
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-white/90">
                <MapPin className="h-5 w-5" />
                {siteConfig.contact.location}
              </li>
            </ul>
          </div>

          <div className="text-center md:text-right">
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-white/70">
              Rechtliches
            </p>
            <nav className="flex flex-col gap-4 text-base" aria-label="Rechtliches">
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
            <div className="mt-8 flex items-center justify-center gap-4 md:justify-end">
              <a
                href={siteConfig.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12 transition-all hover:bg-white/22 hover:scale-105"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12 transition-all hover:bg-white/22 hover:scale-105"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 border-t border-white/12 pt-6 text-center text-sm text-white/75 sm:mt-14 sm:pt-8 sm:text-base">
          © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
        </p>
      </Container>
    </footer>
  );
}
