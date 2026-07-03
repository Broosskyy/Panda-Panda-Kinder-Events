import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { PandaMascot } from "@/components/ui/PandaMascot";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SiteAboutSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";

interface AboutProps {
  about?: SiteAboutSettings;
}

export function About({ about = DEFAULT_SITE_SETTINGS.about }: AboutProps) {
  return (
    <section id="ueber-uns" className="scroll-mt-24 section-padding">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Über uns"
            subtitle="Die Panda-Bande — mit Herz für kleine Abenteurer."
          />
        </ScrollReveal>

        <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-24">
          <ScrollReveal>
            <div className="relative">
              <FlowerOrnament className="pointer-events-none absolute -left-2 -top-4 h-16 w-16 opacity-25 sm:-left-6 sm:-top-6 sm:h-24 sm:w-24 sm:opacity-35" />
              <div className="about-image-frame relative mx-auto aspect-[4/5] max-h-[min(70vh,24rem)] w-full max-w-md sm:max-h-none sm:max-w-none">
                <Image
                  src={about.imageUrl}
                  alt={`${about.founderName} — Gründerin der Panda-Bande Kinderevents`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <PandaMascot size={80} className="absolute -bottom-4 -right-2 hidden opacity-90 md:block" />
              <p className="font-accent mt-6 text-center text-xl text-primary sm:mt-8 sm:text-2xl md:text-3xl lg:text-left">
                Mit Herz für kleine Abenteurer.{" "}
                <span className="text-accent-heart" aria-hidden>
                  ♡
                </span>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <p className="font-accent text-xl leading-snug text-primary sm:text-2xl md:text-[1.85rem] md:leading-snug">
              {about.introText}
            </p>
            <p className="mt-6 text-base leading-relaxed text-text-secondary sm:mt-8 sm:text-lg sm:leading-8 md:text-xl md:leading-9">
              {about.paragraph1}
            </p>
            <p className="mt-5 text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg sm:leading-8 md:text-xl md:leading-9">
              {about.paragraph2}
            </p>

            <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
              {[
                { label: "Unsere Mission", text: about.missionText },
                { label: "Unsere Werte", text: about.valuesText },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-card-mobile)] border border-border/50 bg-bg-secondary/40 p-5 shadow-sm transition-shadow duration-500 hover:shadow-md sm:rounded-[var(--radius-card)] sm:p-7"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary sm:text-sm">
                    {item.label}
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-text-secondary">{item.text}</p>
                </div>
              ))}
            </div>

            <Button href="#kontakt" size="lg" className="mt-10 w-full shadow-lg sm:mt-12 sm:w-auto">
              Lernt uns kennen
            </Button>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
