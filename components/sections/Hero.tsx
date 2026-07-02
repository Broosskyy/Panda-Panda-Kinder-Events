import Image from "next/image";
import { Calendar, Heart } from "lucide-react";
import { siteConfig } from "@/config/site";
import { trustBadges } from "@/lib/trust-badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export function Hero() {
  return (
    <section id="startseite" className="scroll-mt-24 section-padding pt-28 sm:pt-32 md:pt-36">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal>
            <p className="font-accent text-2xl text-primary md:text-[1.5rem]">
              {siteConfig.tagline}{" "}
              <span className="text-accent-heart" aria-hidden>
                ♡
              </span>
            </p>
            <h1 className="font-heading mt-4 text-4xl font-bold leading-[1.1] tracking-tight text-text-primary sm:text-5xl md:text-[3.25rem]">
              {siteConfig.name}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-text-secondary md:text-lg md:leading-8">
              Liebevolle Kinderbetreuung für Hochzeiten, Geburtstage und Familienfeiern — damit
              ihr entspannt feiern könnt.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button href="#kontakt" size="lg" className="w-full sm:w-auto" icon={<Calendar className="h-4 w-4" />}>
                Jetzt anfragen
              </Button>
              <Button
                href="#leistungen"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
                icon={<Heart className="h-4 w-4" />}
              >
                Unsere Leistungen
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-border/60 pt-8 sm:grid-cols-4">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
                  <badge.icon className="h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
                  <span className="text-sm font-medium leading-snug text-text-primary">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150} className="relative mx-auto w-full max-w-lg lg:max-w-none">
            <div
              className="relative aspect-[4/5] w-full overflow-hidden shadow-lg"
              style={{ borderRadius: "4rem 1.5rem 1.5rem 1.5rem" }}
            >
              <Image
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&h=1125&fit=crop&q=80"
                alt="Panda-Bande Team bei der liebevollen Kinderbetreuung"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-5 left-4 right-4 rounded-[var(--radius-card)] border border-border/50 bg-bg-card/95 p-5 shadow-lg backdrop-blur-sm md:-left-8 md:max-w-[280px]">
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md">
                  <Image
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop"
                    alt="Lisa — Gründerin"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">Lisa</p>
                  <p className="text-sm text-text-muted">Gründerin der Panda-Bande</p>
                  <p className="mt-2 text-sm leading-relaxed italic text-text-secondary">
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
