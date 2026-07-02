import Image from "next/image";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Card } from "@/components/ui/Card";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const contactLinks = [
  {
    href: `https://wa.me/${siteConfig.contact.whatsapp}`,
    icon: MessageCircle,
    label: "WhatsApp",
    value: siteConfig.contact.phone,
    external: true,
  },
  {
    href: siteConfig.contact.instagram,
    icon: Instagram,
    label: "Instagram",
    value: siteConfig.contact.instagramHandle,
    external: true,
  },
  {
    href: `mailto:${siteConfig.contact.email}`,
    icon: Mail,
    label: "E-Mail",
    value: siteConfig.contact.email,
    external: false,
  },
  {
    href: null,
    icon: MapPin,
    label: "Einsatzgebiet",
    value: siteConfig.contact.location,
    external: false,
  },
] as const;

export function Contact() {
  return (
    <section id="kontakt" className="scroll-mt-24 section-padding bg-bg-secondary">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Jetzt unverbindlich anfragen"
            subtitle="Erzählt uns von eurem Event — wir melden uns schnellstmöglich bei euch."
          />
        </ScrollReveal>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <InquiryForm />
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <div className="flex flex-col gap-4">
              {contactLinks.map((link) => {
                const Icon = link.icon;
                const content = (
                  <Card className="flex items-center gap-4" padding="sm" hover>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bg-secondary">
                      <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{link.label}</p>
                      <p className="text-sm text-text-secondary">{link.value}</p>
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

              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="block sm:hidden"
              >
                <Card className="flex items-center gap-4" padding="sm" hover>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bg-secondary">
                    <Phone className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">Telefon</p>
                    <p className="text-sm text-text-secondary">{siteConfig.contact.phone}</p>
                  </div>
                </Card>
              </a>

              <div className="mt-6 hidden text-center lg:block">
                <Image
                  src={siteConfig.assets.logo}
                  alt=""
                  width={180}
                  height={64}
                  className="mx-auto h-24 w-auto object-contain"
                />
                <p className="font-accent mt-5 text-2xl text-primary">
                  Mit Herz für kleine Abenteurer.{" "}
                  <span className="text-accent-heart" aria-hidden>
                    ♡
                  </span>
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
