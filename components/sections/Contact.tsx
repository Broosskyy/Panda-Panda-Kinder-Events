import Image from "next/image";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ICON_STROKE } from "@/lib/design";
import type { SiteContactSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { Card } from "@/components/ui/Card";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ContactProps {
  contact?: SiteContactSettings;
}

function buildContactLinks(contact: SiteContactSettings) {
  return [
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
      href: null,
      icon: MapPin,
      label: "Einsatzgebiet",
      value: contact.location,
      external: false,
    },
  ] as const;
}

export function Contact({ contact = DEFAULT_SITE_SETTINGS.contact }: ContactProps) {
  const contactLinks = buildContactLinks(contact);

  return (
    <section id="kontakt" className="relative scroll-mt-24 section-padding section-warm">
      <FlowerOrnament className="absolute right-4 top-20 hidden h-28 w-28 opacity-25 lg:block" variant="right" />

      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Jetzt unverbindlich anfragen"
            subtitle="Erzählt uns von eurem Event — wir melden uns schnellstmöglich bei euch."
          />
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

              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="block sm:hidden">
                <Card className="flex items-center gap-5" padding="md" hover>
                  <div className="icon-wrap h-14 w-14 shrink-0">
                    <Phone className="h-6 w-6 text-primary" strokeWidth={ICON_STROKE} />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-text-primary">Telefon</p>
                    <p className="mt-0.5 text-base text-text-secondary">{contact.phone}</p>
                  </div>
                </Card>
              </a>

              <div className="relative mt-6 hidden text-center lg:block">
                <Image
                  src={siteConfig.assets.logo}
                  alt=""
                  width={200}
                  height={72}
                  className="mx-auto h-24 w-auto object-contain opacity-90"
                />
                <p className="font-accent mt-8 text-3xl text-primary">
                  Mit Herz für kleine Abenteurer.{" "}
                  <span className="text-accent-heart" aria-hidden>
                    ♡
                  </span>
                </p>
                <FlowerOrnament className="absolute -bottom-4 left-0 h-20 w-20 opacity-20" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
