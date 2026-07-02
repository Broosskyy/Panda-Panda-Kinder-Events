import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { PandaMascot } from "@/components/ui/PandaMascot";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  return (
    <section id="ueber-uns" className="scroll-mt-24 section-padding">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Über uns"
            subtitle="Die Panda-Bande — mit Herz für kleine Abenteurer."
          />
        </ScrollReveal>

        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          <ScrollReveal>
            <div className="relative">
              <FlowerOrnament className="absolute -left-6 -top-6 h-24 w-24 opacity-40" />
              <div
                className="relative aspect-[4/5] overflow-hidden"
                style={{ borderRadius: "1.75rem 4.5rem 1.75rem 1.75rem", boxShadow: "var(--shadow-hero)" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1000&fit=crop&q=85"
                  alt="Lisa — Gründerin der Panda-Bande Kinderevents"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <PandaMascot
                size={80}
                className="absolute -bottom-4 -right-2 hidden opacity-90 md:block"
              />
              <p className="font-accent mt-6 text-center text-2xl text-primary md:text-3xl lg:text-left">
                Mit Herz für kleine Abenteurer.{" "}
                <span className="text-accent-heart" aria-hidden>
                  ♡
                </span>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <p className="font-accent text-2xl leading-snug text-primary md:text-[1.75rem]">
              Hallo, ich bin Lisa — die Gründerin der Panda-Bande.
            </p>
            <p className="mt-8 text-lg leading-relaxed text-text-secondary md:text-xl md:leading-9">
              Panda-Bande entstand aus einer einfachen Überzeugung: Kinder gehören auf Feiern
              nicht an den Rand, sondern ins Herz des Moments.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl md:leading-9">
              Was als Herzensprojekt begann, ist heute ein erfahrenes Team aus Betreuern, die
              mit Kreativität, Geduld und echter Freude arbeiten — damit ihr entspannt feiern könnt.
            </p>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {[
                {
                  label: "Unsere Mission",
                  text: "Magische Momente für Kinder — sorgenfreie Erlebnisse für Familien.",
                },
                {
                  label: "Unsere Werte",
                  text: "Herzlichkeit, Sicherheit, Kreativität und Verlässlichkeit.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[var(--radius-card)] border border-border/60 bg-bg-secondary/50 p-7 shadow-sm"
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                    {item.label}
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-text-secondary">{item.text}</p>
                </div>
              ))}
            </div>

            <Button href="#kontakt" size="lg" className="mt-12 w-full shadow-lg sm:w-auto">
              Lernt uns kennen
            </Button>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
