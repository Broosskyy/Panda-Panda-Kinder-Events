import Image from "next/image";
import { Calendar, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { trustBadges } from "@/lib/trust-badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function LisaBadge({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-[var(--radius-card)] bg-bg-card p-4 sm:p-5 ${className}`}>
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
          <p className="font-accent text-base text-primary sm:text-lg">Hallo, ich bin Lisa!</p>
          <p className="text-xs font-medium text-text-muted sm:text-sm">Gründerin der Panda-Bande</p>
          <p className="mt-1.5 text-xs leading-relaxed text-text-secondary sm:mt-2 sm:text-sm">
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
      className="hero-section relative scroll-mt-20 overflow-hidden section-padding-lg pt-24 sm:scroll-mt-24 sm:pt-32 md:pt-40 lg:pt-44"
    >
      <FlowerOrnament className="pointer-events-none absolute left-0 top-20 h-20 w-20 opacity-40 sm:-left-4 sm:top-24 sm:h-28 sm:w-28 sm:opacity-60 md:h-40 md:w-40" />
      <FlowerOrnament
        variant="right"
        className="pointer-events-none absolute -right-4 top-32 hidden h-24 w-24 opacity-40 md:block lg:h-36 lg:w-36 lg:opacity-50"
      />

      <Container>
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16 xl:gap-24">
          <ScrollReveal className="relative z-10 order-1 max-w-xl lg:order-none">
            <p className="font-accent text-xl leading-snug text-primary sm:text-[1.65rem] md:text-[1.85rem]">
              {siteConfig.tagline}{" "}
              <span className="text-accent-heart" aria-hidden>
                ♡
              </span>
            </p>
            <h1 className="font-heading mt-4 text-[2rem] font-bold leading-[1.08] tracking-tight text-text-primary sm:mt-6 sm:text-[2.5rem] md:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
              {siteConfig.name}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg md:text-xl md:leading-9">
              Liebevolle Kinderbetreuung für eure besonderen Momente.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4">
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
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-border/50 pt-6 sm:mt-12 sm:gap-5 sm:pt-8 md:grid-cols-4 md:gap-6 md:pt-10">
              {trustBadges.map((badge) => (
                <div
                  key={badge.text}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-bg-secondary/60 px-2 py-3 text-center sm:flex-row sm:items-start sm:gap-3 sm:bg-transparent sm:p-0 sm:text-left md:flex-col md:items-start"
                >
                  <badge.icon className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" strokeWidth={1.25} aria-hidden />
                  <span className="text-xs font-medium leading-snug text-text-primary sm:text-sm md:text-base">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="relative order-2 lg:-mr-6 lg:order-none xl:-mr-10">
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

            {/* Mobile: Badge im normalen Flow unter dem Bild */}
            <div className="hero-badge mt-4 lg:hidden">
              <LisaBadge className="!bg-transparent !p-0" />
            </div>

            {/* Desktop: schwebendes Badge */}
            <div className="hero-badge absolute -bottom-6 left-6 z-10 hidden max-w-[280px] bg-bg-card/95 backdrop-blur-sm lg:block lg:max-w-[300px]">
              <LisaBadge className="!bg-transparent !p-0" />
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
