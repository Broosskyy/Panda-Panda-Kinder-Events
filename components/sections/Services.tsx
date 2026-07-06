"use client";

import Image from "next/image";
import { useState } from "react";
import { X } from "lucide-react";
import { resolveServiceIcon } from "@/lib/cms/icons";
import type { Service } from "@/lib/services";
import { ICON_STROKE } from "@/lib/design";
import type { SiteSectionHeading } from "@/lib/cms/types";
import { resolveSectionHeading } from "@/lib/cms/normalize-settings";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionCta } from "@/components/ui/SectionCta";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ServicesProps {
  items?: Service[];
  heading?: SiteSectionHeading;
}

export function Services({
  items,
  heading,
}: ServicesProps) {
  const safeHeading = resolveSectionHeading(heading, "services");
  const [active, setActive] = useState<Service | null>(null);

  if (!items?.length) return null;

  return (
    <section id="leistungen" className="section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading title={safeHeading.title} subtitle={safeHeading.subtitle} />
        </ScrollReveal>

        <div className="swipe-bleed md:mx-0 md:px-0">
          <ul
            className="swipe-track md:grid md:grid-cols-2 md:gap-7 md:overflow-visible lg:grid-cols-3 lg:gap-8"
            role="list"
            aria-label="Leistungen"
          >
            {items.map((service, i) => {
              const Icon = resolveServiceIcon(service.iconKey);
              return (
              <li key={service.title} className="swipe-item w-[min(88vw,20rem)] sm:w-[min(85vw,22rem)] md:w-auto">
                <ScrollReveal delay={i * 60}>
                  <Card className="card-equal flex h-full flex-col" padding="md">
                    {service.imageUrl ? (
                      <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-2xl">
                        <Image
                          src={service.imageUrl}
                          alt={service.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 88vw, 33vw"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="icon-wrap mb-5 h-14 w-14 md:mb-6 md:h-16 md:w-16">
                        <Icon
                          className="h-7 w-7 text-primary md:h-8 md:w-8"
                          strokeWidth={ICON_STROKE}
                          aria-hidden
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">{service.title}</h3>
                    <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
                      {service.description}
                    </p>
                    <Button
                      variant="secondary"
                      className="btn-equal mt-5 w-full"
                      onClick={() => setActive(service)}
                    >
                      {service.buttonLabel ?? "Mehr erfahren"}
                    </Button>
                  </Card>
                </ScrollReveal>
              </li>
              );
            })}
          </ul>
        </div>

        <ScrollReveal>
          <SectionCta className="mt-12 sm:mt-16" />
        </ScrollReveal>
      </Container>

      {active ? (
        <div className="service-modal-root" role="dialog" aria-modal="true" aria-label={active.title}>
          <button type="button" className="service-modal-backdrop" onClick={() => setActive(null)} aria-label="Schließen" />
          <div className="service-modal-panel">
            <button type="button" className="service-modal-close" onClick={() => setActive(null)} aria-label="Schließen">
              <X className="h-5 w-5" />
            </button>
            {active.imageUrl ? (
              <div className="relative mb-5 aspect-[16/9] w-full overflow-hidden rounded-2xl">
                <Image src={active.imageUrl} alt={active.title} fill className="object-cover" sizes="560px" />
              </div>
            ) : null}
            <h3 className="font-heading text-2xl font-bold text-text-primary">{active.title}</h3>
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-text-secondary">
              {active.detailText ?? active.description}
            </p>
            <Button
              size="lg"
              className="btn-equal mt-6 w-full"
              onClick={() => {
                setActive(null);
                document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Jetzt Termin anfragen
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
