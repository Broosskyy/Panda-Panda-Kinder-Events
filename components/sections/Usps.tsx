import { usps } from "@/lib/usps";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Usps() {
  return (
    <section className="scroll-mt-24 section-padding bg-bg-secondary/50">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Warum Panda-Bande?"
            subtitle="Professionelle Betreuung mit echter Herzlichkeit — für unvergessliche Momente."
          />
        </ScrollReveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {usps.map((usp, i) => (
            <ScrollReveal key={usp.title} delay={i * 80}>
              <Card className="h-full text-center sm:text-left" padding="md">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary sm:mx-0">
                  <usp.icon className="h-7 w-7 text-primary" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-text-primary md:text-xl">{usp.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base md:leading-7">
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
