import { usps } from "@/lib/usps";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Usps() {
  return (
    <section className="scroll-mt-24 section-padding bg-bg-warm/60">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Warum Panda-Bande?"
            subtitle="Professionelle Betreuung mit echter Herzlichkeit — für unvergessliche Momente."
          />
        </ScrollReveal>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {usps.map((usp, i) => (
            <ScrollReveal key={usp.title} delay={i * 80}>
              <Card className="h-full text-center sm:text-left" padding="lg">
                <div className="mx-auto mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.25rem] bg-bg-secondary sm:mx-0">
                  <usp.icon className="h-9 w-9 text-primary" strokeWidth={1.25} aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">{usp.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-text-secondary md:leading-8">
                  {usp.description}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
