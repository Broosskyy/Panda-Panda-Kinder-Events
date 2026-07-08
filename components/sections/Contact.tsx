import { Instagram, Mail, MapPin, MessageCircle, Phone, Clock } from "lucide-react";
import { ICON_STROKE } from "@/lib/design";
import type { SiteContactSettings, SiteSectionHeading } from "@/lib/cms/types";
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
  heading?: SiteSectionHeading;
  privacyHint?: string;
}

function buildContactLinks(contact: SiteContactSettings) {
  const phone = contact.phone?.trim() ?? "";
  const whatsapp = contact.whatsapp?.trim() ?? "";
  const email = contact.email?.trim() ?? "";
  const instagram = contact.instagram?.trim() ?? "";
  const instagramHandle = contact.instagramHandle?.trim() ?? "Instagram";
  const location = contact.location?.trim() ?? "";

  const links = [
    phone
      ? {
          href: `tel:${phone.replace(/\s/g, "")}`,
          icon: Phone,
          label: "Telefon",
          value: phone,
          external: false,
        }
      : null,
    whatsapp
      ? {
          href: `https://wa.me/${whatsapp}`,
          icon: MessageCircle,
          label: "WhatsApp",
          value: phone || "WhatsApp schreiben",
          external: true,
        }
      : null,
    instagram
      ? {
          href: instagram,
          icon: Instagram,
          label: "Instagram",
          value: instagramHandle,
          external: true,
        }
      : null,
    email
      ? {
          href: `mailto:${email}`,
          icon: Mail,
          label: "E-Mail",
          value: email,
          external: false,
        }
      : null,
    location
      ? {
          href: contact.mapsUrl?.trim() || `https://maps.google.com/?q=${encodeURIComponent(location)}`,
          icon: MapPin,
          label: "Standort",
          value: location,
          external: true,
        }
      : null,
  ] as const;

  return links.filter((link): link is NonNullable<typeof link> => link !== null);
}

export function Contact({
  contact = DEFAULT_SITE_SETTINGS.contact,
  heading,
  privacyHint,
}: ContactProps) {
  const safeHeading = resolveSectionHeading(heading, "contact");
  const contactLinks = buildContactLinks(contact);

  return (
    <section id="kontakt" className="relative section-padding section-warm form-chrome-safe">
      <FlowerOrnament className="absolute right-4 top-20 hidden h-28 w-28 opacity-25 lg:block" variant="right" />

      <Container>
        <ScrollReveal>
          <SectionHeading title={safeHeading.title} subtitle={safeHeading.subtitle} />
        </ScrollReveal>

        <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal>
            <Card padding="lg" hover={false} className="form-luxury">
              <InquiryForm privacyHint={privacyHint} />
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex flex-col gap-4 sm:gap-5">
              {(contact.responseTime || contact.openingHours) ? (
                <Card className="border-primary/15 bg-primary/5" padding="md" hover={false}>
                  <div className="flex items-start gap-4">
                    <div className="icon-wrap h-12 w-12 shrink-0">
                      <Clock className="h-5 w-5 text-primary sm:h-6 sm:w-6" strokeWidth={ICON_STROKE} />
                    </div>
                    <div>
                      {contact.responseTime ? (
                        <p className="text-base font-semibold text-text-primary">{contact.responseTime}</p>
                      ) : null}
                      {contact.openingHours ? (
                        <p className="mt-1 text-[0.9375rem] text-text-secondary sm:text-base">{contact.openingHours}</p>
                      ) : null}
                    </div>
                  </div>
                </Card>
              ) : null}

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
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
