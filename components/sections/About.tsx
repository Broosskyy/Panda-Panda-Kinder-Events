import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
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

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal>
            <div className="relative">
              <div
                className="relative aspect-[4/5] overflow-hidden shadow-lg"
                style={{ borderRadius: "1.5rem 4rem 1.5rem 1.5rem" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&h=1000&fit=crop&q=80"
                  alt="Lisa — Gründerin der Panda-Bande Kinderevents"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </div>
              <p className="font-accent mt-5 text-center text-2xl text-primary lg:text-left">
                Mit Herz für kleine Abenteurer.{" "}
                <span className="text-accent-heart" aria-hidden>
                  ♡
                </span>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <p className="font-accent text-xl text-primary md:text-2xl">
              Hallo, ich bin Lisa — die Gründerin der Panda-Bande.
            </p>
            <p className="mt-6 text-base leading-relaxed text-text-secondary md:text-lg md:leading-8">
              Panda-Bande entstand aus einer einfachen Überzeugung: Kinder gehören auf Feiern
              nicht an den Rand, sondern ins Herz des Moments. Als Mutter und leidenschaftliche
              Kinderbetreuerin wollte ich einen Ort schaffen, an dem kleine Gäste sich wirklich
              gesehen und verstanden fühlen.
            </p>
            <p className="mt-5 text-base leading-relaxed text-text-secondary md:text-lg md:leading-8">
              Was als Herzensprojekt begann, ist heute ein erfahrenes Team aus Betreuern, die
              mit Kreativität, Geduld und echter Freude arbeiten. Ob Hochzeit, Geburtstag oder
              Firmenevent — wir sorgen dafür, dass eure kleinen Gäste strahlen und ihr als
              Eltern oder Gastgeber entspannt feiern könnt.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
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
                  className="rounded-[var(--radius-card)] border border-border bg-bg-card p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-primary">{item.label}</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary md:text-base">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <Button href="#kontakt" size="lg" className="mt-10 w-full sm:w-auto">
              Lernt uns kennen
            </Button>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
