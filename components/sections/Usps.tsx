import { usps } from "@/lib/usps";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Usps() {
  return (
    <section className="scroll-mt-24 section-padding border-y border-border/40 bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Warum Panda-Bande?"
            subtitle="Professionelle Betreuung mit echter Herzlichkeit — für unvergessliche Momente."
          />
        </ScrollReveal>

        {/* Desktop: leichte Icon-Zeile wie Mockup — ohne schwere Karten */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-10">
          {usps.map((usp, i) => (
            <ScrollReveal key={usp.title} delay={i * 80}>
              <div
                className={`text-center ${i < usps.length - 1 ? "border-r border-border/50 pr-10" : ""}`}
              >
                <usp.icon className="mx-auto h-9 w-9 text-primary" strokeWidth={1.25} aria-hidden />
                <h3 className="mt-5 text-lg font-semibold text-text-primary">{usp.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">{usp.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Mobile: Karten für Touch & Lesbarkeit */}
        <div className="grid gap-5 sm:grid-cols-2 lg:hidden">
          {usps.map((usp, i) => (
            <ScrollReveal key={usp.title} delay={i * 80}>
              <Card className="h-full text-center sm:text-left" padding="lg" hover>
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary sm:mx-0">
                  <usp.icon className="h-8 w-8 text-primary" strokeWidth={1.25} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">{usp.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">{usp.description}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
