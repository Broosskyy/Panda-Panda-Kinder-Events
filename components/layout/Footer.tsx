import { Instagram, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="bg-primary text-text-inverse">
      <Container className="py-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo variant="inverse" />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm" aria-label="Rechtliches">
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
          <div className="flex items-center gap-4">
            <a
              href={siteConfig.contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={`https://wa.me/${siteConfig.contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-white/70">
          © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
        </p>
      </Container>
    </footer>
  );
}
