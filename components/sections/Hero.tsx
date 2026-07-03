import Image from "next/image";
import { Calendar, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { trustBadges } from "@/lib/trust-badges";
import { ICON_STROKE } from "@/lib/design";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function LisaBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] bg-bg-card p-4 sm:p-6 ${className}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md sm:h-16 sm:w-16 sm:ring-[3px]">
          <Image
            src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop"
            alt="Lisa — Gründerin"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <p className="font-accent text-base text-primary sm:text-xl">Hallo, ich bin Lisa!</p>
          <p className="text-xs font-medium tracking-wide text-text-muted sm:text-sm">
            Gründerin der Panda-Bande
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary sm:mt-2.5 sm:text-sm sm:leading-relaxed">
            &ldquo;Jedes Kind verdient einen Tag voller Abenteuer.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="startseite"
      className="hero-section relative scroll-mt-20 overflow-hidden section-padding-lg pt-24 sm:scroll-mt-24 sm:pt-32 md:pt-40 lg:pt-48"
    >
      <FlowerOrnament className="pointer-events-none absolute left-0 top-20 h-20 w-20 opacity-35 sm:-left-4 sm:top-24 sm:h-28 sm:w-28 sm:opacity-50 md:h-40 md:w-40" />
      <FlowerOrnament
        variant="right"
        className="pointer-events-none absolute -right-4 top-32 hidden h-24 w-24 opacity-35 md:block lg:h-36 lg:w-36 lg:opacity-45"
      />

      <Container>
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20 xl:gap-28">
          <ScrollReveal className="relative z-10 order-1 max-w-xl lg:order-none lg:py-4">
            <p className="font-accent text-xl leading-snug text-primary sm:text-[1.75rem] md:text-[2rem]">
              {siteConfig.tagline}{" "}
              <span className="text-accent-heart" aria-hidden>
                ♡
              </span>
            </p>
            <h1 className="font-heading mt-5 text-[2rem] font-bold leading-[1.08] tracking-tight text-text-primary sm:mt-7 sm:text-[2.65rem] md:text-5xl lg:mt-8 lg:text-[3.65rem] lg:leading-[1.04]">
              {siteConfig.name}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-text-secondary sm:mt-7 sm:text-lg sm:leading-8 md:text-xl md:leading-9">
              Liebevolle Kinderbetreuung für eure besonderen Momente.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
              <Button
                href="#kontakt"
                size="lg"
                className="w-full shadow-lg sm:w-auto sm:shadow-xl"
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
            <div className="mt-10 grid grid-cols-2 gap-3 border-t border-border/40 pt-8 sm:mt-14 sm:gap-4 sm:pt-10 md:grid-cols-4 lg:gap-6">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="trust-chip">
                  <div className="trust-chip-icon">
                    <badge.icon className="h-5 w-5 text-primary md:h-6 md:w-6" strokeWidth={ICON_STROKE} aria-hidden />
                  </div>
                  <span className="text-xs font-medium leading-snug text-text-primary sm:text-sm lg:text-[0.9375rem]">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="relative order-2 lg:-mr-4 lg:order-none xl:-mr-8">
            <div className="hero-image-wrap relative aspect-[5/6] w-full max-h-[min(48vh,20rem)] overflow-hidden sm:aspect-[4/5] sm:max-h-none">
              <Image
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000&h=1250&fit=crop&q=85"
                alt="Panda-Bande Team bei der liebevollen Kinderbetreuung"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
            </div>

            <div className="hero-badge mt-5 lg:hidden">
              <LisaBadge className="!bg-transparent !p-0" />
            </div>

            <div className="hero-badge absolute -bottom-8 left-8 z-10 hidden max-w-[300px] bg-bg-card/95 p-1 backdrop-blur-md lg:block">
              <LisaBadge className="!bg-transparent !p-0" />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
