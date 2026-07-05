import { type Service } from "@/lib/services";
import { ICON_STROKE } from "@/lib/design";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ServicesProps {
  items?: Service[];
}

export function Services({ items }: ServicesProps) {
  if (!items?.length) return null;

  return (
    <section id="leistungen" className="scroll-mt-24 section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Unsere Leistungen"
            subtitle="Von der Hochzeit bis zum Kindergeburtstag — wir gestalten unvergessliche Momente."
          />
        </ScrollReveal>

        <div className="swipe-bleed md:mx-0 md:px-0">
          <ul
            className="swipe-track md:grid md:grid-cols-2 md:gap-7 md:overflow-visible lg:grid-cols-4 lg:gap-8"
            role="list"
            aria-label="Leistungen"
          >
            {items.map((service, i) => (
              <li key={service.title} className="swipe-item w-[min(88vw,20rem)] sm:w-[min(85vw,22rem)] md:w-auto">
                <ScrollReveal delay={i * 60}>
                  <Card className="h-full" padding="md">
                    <div className="icon-wrap mb-5 h-14 w-14 md:mb-6 md:h-16 md:w-16">
                      <service.icon
                        className="h-7 w-7 text-primary md:h-8 md:w-8"
                        strokeWidth={ICON_STROKE}
                        aria-hidden
                      />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">{service.title}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
                      {service.description}
                    </p>
                  </Card>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
