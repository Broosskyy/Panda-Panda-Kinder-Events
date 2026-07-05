import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ICON_STROKE } from "@/lib/design";
import type { SiteContactSettings, SiteFooterSettings, SiteSectionHeading } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { resolveSectionHeading } from "@/lib/cms/normalize-settings";
import { Card } from "@/components/ui/Card";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ContactProps {
  contact?: SiteContactSettings;
  footer?: SiteFooterSettings;
  heading?: SiteSectionHeading;
}

function buildContactLinks(contact: SiteContactSettings) {
  return [
    {
      href: `tel:${contact.phone.replace(/\s/g, "")}`,
      icon: Phone,
      label: "Telefon",
      value: contact.phone,
      external: false,
    },
    {
      href: `https://wa.me/${contact.whatsapp}`,
      icon: MessageCircle,
      label: "WhatsApp",
      value: contact.phone,
      external: true,
    },
    {
      href: contact.instagram,
      icon: Instagram,
      label: "Instagram",
      value: contact.instagramHandle,
      external: true,
    },
    {
      href: `mailto:${contact.email}`,
      icon: Mail,
      label: "E-Mail",
      value: contact.email,
      external: false,
    },
    {
      href: contact.mapsUrl?.trim() || `https://maps.google.com/?q=${encodeURIComponent(contact.location)}`,
      icon: MapPin,
      label: "Standort",
      value: contact.location,
      external: true,
    },
  ] as const;
}

export function Contact({
  contact = DEFAULT_SITE_SETTINGS.contact,
  footer = DEFAULT_SITE_SETTINGS.footer,
  heading,
}: ContactProps) {
  const safeHeading = resolveSectionHeading(heading, "contact");
  const contactLinks = buildContactLinks(contact);

  return (
    <section id="kontakt" className="relative section-padding section-warm">
      <FlowerOrnament className="absolute right-4 top-20 hidden h-28 w-28 opacity-25 lg:block" variant="right" />

      <Container>
        <ScrollReveal>
          <SectionHeading title={safeHeading.title} subtitle={safeHeading.subtitle} />
        </ScrollReveal>

        <div className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal>
            <Card padding="lg" hover={false} className="form-luxury">
              <InquiryForm />
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex flex-col gap-4 sm:gap-5">
              {contactLinks.map((link) => {
                const Icon = link.icon;
                const content = (
                  <Card className="flex items-center gap-4 sm:gap-5" padding="md" hover>
                    <div className="icon-wrap h-12 w-12 shrink-0 sm:h-14 sm:w-14">
                      <Icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" strokeWidth={ICON_STROKE} />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-text-primary">{link.label}</p>
                      <p className="mt-0.5 text-[0.9375rem] text-text-secondary sm:text-base">{link.value}</p>
                    </div>
                  </Card>
                );

                if (link.href) {
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="block"
                    >
                      {content}
                    </a>
                  );
                }

                return <div key={link.label}>{content}</div>;
              })}

              {footer.tagline ? (
                <div className="relative mt-6 hidden text-center lg:block">
                  <p className="font-accent text-3xl text-primary">{footer.tagline}</p>
                  <FlowerOrnament className="absolute -bottom-4 left-0 h-20 w-20 opacity-20" />
                </div>
              ) : null}
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
