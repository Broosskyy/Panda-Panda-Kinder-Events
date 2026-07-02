import Image from "next/image";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Contact() {
  return (
    <section id="kontakt" className="scroll-mt-24 bg-bg-secondary py-16 md:py-20">
      <Container>
        <SectionHeading
          title="Jetzt unverbindlich anfragen"
          subtitle="Erzählt uns von eurem Event — wir melden uns schnellstmöglich bei euch."
        />
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <InquiryForm />
          </div>
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              <a
                href={`https://wa.me/${siteConfig.contact.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:bg-white"
              >
                <MessageCircle className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-text-primary">WhatsApp</p>
                  <p className="text-sm text-text-secondary">{siteConfig.contact.phone}</p>
                </div>
              </a>
              <a
                href={siteConfig.contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:bg-white"
              >
                <Instagram className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-text-primary">Instagram</p>
                  <p className="text-sm text-text-secondary">{siteConfig.contact.instagramHandle}</p>
                </div>
              </a>
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:bg-white"
              >
                <Mail className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-text-primary">E-Mail</p>
                  <p className="text-sm text-text-secondary">{siteConfig.contact.email}</p>
                </div>
              </a>
              <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4">
                <MapPin className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-text-primary">Einsatzgebiet</p>
                  <p className="text-sm text-text-secondary">{siteConfig.contact.location}</p>
                </div>
              </div>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-bg-card p-4 transition-colors hover:bg-white sm:hidden"
              >
                <Phone className="h-6 w-6 text-primary" strokeWidth={1.5} />
                <div>
                  <p className="text-sm font-medium text-text-primary">Telefon</p>
                  <p className="text-sm text-text-secondary">{siteConfig.contact.phone}</p>
                </div>
              </a>
            </div>
            <div className="mt-10 hidden text-center lg:block">
              <Image
                src="/logo.svg"
                alt="Panda-Bande Logo"
                width={120}
                height={120}
                className="mx-auto"
              />
              <p className="font-accent mt-4 text-2xl text-primary">
                Mit Herz für kleine Abenteurer. <span className="text-accent-heart">♡</span>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
