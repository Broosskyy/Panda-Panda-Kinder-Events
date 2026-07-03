import Image from "next/image";
import { Calendar, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { trustBadges } from "@/lib/trust-badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function Hero() {
  return (
    <section
      id="startseite"
      className="relative scroll-mt-24 overflow-hidden section-padding-lg pt-32 sm:pt-36 md:pt-44"
    >
      <FlowerOrnament className="absolute -left-8 top-24 h-32 w-32 opacity-60 md:h-40 md:w-40" />
      <FlowerOrnament
        variant="right"
        className="absolute -right-6 top-40 hidden h-28 w-28 opacity-50 md:block lg:h-36 lg:w-36"
      />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16 xl:gap-24">
          <ScrollReveal className="relative z-10 max-w-xl">
            <p className="font-accent text-[1.65rem] leading-snug text-primary md:text-[1.85rem]">
              {siteConfig.tagline}{" "}
              <span className="text-accent-heart" aria-hidden>
                ♡
              </span>
            </p>
            <h1 className="font-heading mt-6 text-[2.5rem] font-bold leading-[1.05] tracking-tight text-text-primary sm:text-5xl md:text-[3.5rem] lg:text-[3.75rem]">
              {siteConfig.name}
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-text-secondary md:text-xl md:leading-9">
              Liebevolle Kinderbetreuung für eure besonderen Momente.
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                href="#kontakt"
                size="lg"
                className="w-full shadow-xl sm:w-auto"
                icon={<Calendar className="h-5 w-5" aria-hidden />}
              >
                Jetzt anfragen
              </Button>
              <Button
                href="#leistungen"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                icon={<Heart className="h-5 w-5" aria-hidden />}
              >
                Unsere Leistungen
              </Button>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-6 border-t border-border/50 pt-10 sm:grid-cols-4">
              {trustBadges.map((badge) => (
                <div
                  key={badge.text}
                  className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left"
                >
                  <badge.icon className="h-6 w-6 text-primary" strokeWidth={1.25} aria-hidden />
                  <span className="text-sm font-medium leading-snug text-text-primary md:text-base">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="relative lg:-mr-6 xl:-mr-10">
            <div className="hero-image-wrap relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000&h=1250&fit=crop&q=85"
                alt="Panda-Bande Team bei der liebevollen Kinderbetreuung"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>

            {/* Mockup: bottom-left on desktop; top on mobile for bessere Lesbarkeit */}
            <div className="hero-badge absolute -top-4 left-4 right-4 z-10 rounded-[var(--radius-card)] bg-bg-card/95 p-5 md:left-6 md:right-auto md:max-w-[300px] lg:-bottom-6 lg:top-auto lg:left-8 lg:max-w-[280px]">
              <div className="flex items-start gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-[3px] ring-white shadow-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop"
                    alt="Lisa — Gründerin"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-accent text-lg text-primary">Hallo, ich bin Lisa!</p>
                  <p className="text-sm font-medium text-text-muted">Gründerin der Panda-Bande</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    &ldquo;Jedes Kind verdient einen Tag voller Abenteuer.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
