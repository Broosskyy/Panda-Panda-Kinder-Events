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

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12" role="list">
          {usps.map((usp, i) => (
            <li key={usp.title}>
              <ScrollReveal delay={i * 80}>
                <Card
                  className={`h-full text-center sm:text-left lg:border-0 lg:bg-transparent lg:shadow-none lg:hover:shadow-none ${
                    i < usps.length - 1 ? "lg:border-r lg:border-border/40 lg:rounded-none lg:pr-12" : ""
                  }`}
                  padding="md"
                  hover
                >
                  <div className="icon-wrap mx-auto mb-5 h-14 w-14 sm:mx-0 lg:mx-auto lg:mb-6 lg:h-16 lg:w-16">
                    <usp.icon
                      className="h-7 w-7 text-primary sm:h-8 sm:w-8 lg:h-8 lg:w-8"
                      strokeWidth={ICON_STROKE}
                      aria-hidden
                    />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-text-primary lg:text-center">{usp.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base lg:text-center">
                    {usp.description}
                  </p>
                </Card>
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
