"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { focusRing } from "@/lib/a11y";
import type { Service } from "@/lib/services";
import type { SiteSectionHeading } from "@/lib/cms/types";
import { resolveSectionHeading } from "@/lib/cms/normalize-settings";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

import { LANDSCAPE_BLUR_DATA_URL } from "@/lib/image-placeholder";

const SERVICE_IMAGE_FALLBACK =
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=500&fit=crop&q=85";

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

  useEffect(() => {
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  if (!items?.length) return null;

  return (
    <section id="leistungen" className="section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading title={safeHeading.title} subtitle={safeHeading.subtitle} />
        </ScrollReveal>

        <div className="swipe-bleed swipe-bleed-reset-md">
          <ul
            className="swipe-track md:grid md:grid-cols-2 md:gap-7 md:overflow-visible lg:grid-cols-3 lg:gap-8"
            role="list"
            aria-label="Leistungen"
          >
            {items.map((service, i) => {
              return (
              <li key={service.title} className="swipe-item swipe-item-card md:w-auto">
                <ScrollReveal delay={i * 60}>
                  <Card className="card-equal service-card flex h-full flex-col" padding="md">
                    <div className="service-card-image relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-bg-secondary sm:mb-4">
                      <Image
                        src={service.imageUrl?.trim() || SERVICE_IMAGE_FALLBACK}
                        alt={service.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 88vw, 33vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={LANDSCAPE_BLUR_DATA_URL}
                      />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">{service.title}</h3>
                    {service.priceFrom ? (
                      <p className="mt-2 text-sm font-semibold text-primary">ab {service.priceFrom}</p>
                    ) : null}
                    <p className="service-card-desc mt-2 flex-1 text-[0.9375rem] leading-relaxed text-text-secondary sm:mt-3 sm:text-base">
                      {service.description}
                    </p>
                    {service.highlights?.length ? (
                      <ul className="service-card-highlights mt-2 space-y-1 text-sm text-text-muted sm:mt-3" aria-label="Highlights">
                        {service.highlights.slice(0, 3).map((h) => (
                          <li key={h}>• {h}</li>
                        ))}
                      </ul>
                    ) : null}
                    <Button
                      variant="secondary"
                      className="service-card-cta btn-equal mt-4 w-full sm:mt-5"
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
      </Container>

      {active ? (
        <div className="service-modal-root" role="dialog" aria-modal="true" aria-label={active.title}>
          <button type="button" className="service-modal-backdrop" onClick={() => setActive(null)} aria-label="Schließen" />
          <div className="service-modal-panel">
            <button
              type="button"
              className={`service-modal-close ${focusRing}`}
              onClick={() => setActive(null)}
              aria-label="Dialog schließen"
            >
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
                const link = active.buttonLink?.trim();
                if (link) {
                  if (link.startsWith("#")) {
                    document.querySelector(link)?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = link;
                  }
                  return;
                }
                document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {active.buttonLabel ?? "Beratung anfragen"}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
