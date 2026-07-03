import { usps } from "@/lib/usps";
import { ICON_STROKE } from "@/lib/design";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Usps() {
  return (
    <section className="scroll-mt-24 section-padding border-y border-border/30 bg-bg-secondary/30">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Warum Panda-Bande?"
            subtitle="Professionelle Betreuung mit echter Herzlichkeit — für unvergessliche Momente."
          />
        </ScrollReveal>

        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-12">
          {usps.map((usp, i) => (
            <ScrollReveal key={usp.title} delay={i * 80}>
              <div
                className={`text-center ${i < usps.length - 1 ? "border-r border-border/40 pr-12" : ""}`}
              >
                <div className="icon-wrap mx-auto h-16 w-16">
                  <usp.icon className="h-8 w-8 text-primary" strokeWidth={ICON_STROKE} aria-hidden />
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-text-primary">{usp.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">{usp.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:hidden">
          {usps.map((usp, i) => (
            <ScrollReveal key={usp.title} delay={i * 80}>
              <Card className="h-full text-center sm:text-left" padding="md" hover>
                <div className="icon-wrap mx-auto mb-5 h-14 w-14 sm:mx-0">
                  <usp.icon className="h-7 w-7 text-primary sm:h-8 sm:w-8" strokeWidth={ICON_STROKE} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-text-primary">{usp.title}</h3>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
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
