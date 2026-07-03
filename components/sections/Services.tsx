import { services as defaultServices, type Service } from "@/lib/services";
import { ICON_STROKE } from "@/lib/design";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ServicesProps {
  items?: Service[];
}

export function Services({ items = defaultServices }: ServicesProps) {
  return (
    <section id="leistungen" className="scroll-mt-24 section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Unsere Leistungen"
            subtitle="Von der Hochzeit bis zum Kindergeburtstag — wir gestalten unvergessliche Momente."
          />
        </ScrollReveal>

        <div className="swipe-bleed md:hidden">
          <div className="swipe-track" role="region" aria-label="Leistungen — horizontal scrollen">
            {items.map((service) => (
              <div key={service.title} className="swipe-item w-[min(88vw,20rem)] sm:w-[min(85vw,22rem)]">
                <Card className="h-full" padding="md">
                  <div className="icon-wrap mb-5 h-14 w-14">
                    <service.icon className="h-7 w-7 text-primary" strokeWidth={ICON_STROKE} aria-hidden />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">{service.title}</h3>
                  <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base">
                    {service.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden gap-7 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {items.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 60}>
              <Card className="h-full" padding="lg">
                <div className="icon-wrap mb-6 h-16 w-16">
                  <service.icon className="h-8 w-8 text-primary" strokeWidth={ICON_STROKE} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-text-primary">{service.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">{service.description}</p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
