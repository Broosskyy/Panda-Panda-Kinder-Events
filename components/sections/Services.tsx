import { services } from "@/lib/services";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Services() {
  return (
    <section id="leistungen" className="scroll-mt-24 section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Unsere Leistungen"
            subtitle="Von der Hochzeit bis zum Kindergeburtstag — wir gestalten unvergessliche Momente."
          />
        </ScrollReveal>

        <div
          className="swipe-track -mx-5 gap-5 px-5 md:hidden"
          role="region"
          aria-label="Leistungen — horizontal scrollen"
        >
          {services.map((service) => (
            <div key={service.title} className="swipe-item w-[min(88vw,22rem)]">
              <Card className="h-full" padding="lg" variant="beige">
                <div className="mb-6 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.25rem] bg-bg-card shadow-sm">
                  <service.icon className="h-10 w-10 text-primary" strokeWidth={1.25} aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">{service.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-text-secondary">
                  {service.description}
                </p>
              </Card>
            </div>
          ))}
        </div>

        <div className="hidden gap-7 md:grid md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 60}>
              <Card className="h-full" padding="lg" variant="beige">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-bg-card shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <service.icon className="h-9 w-9 text-primary" strokeWidth={1.25} aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">{service.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-text-secondary">
                  {service.description}
                </p>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
