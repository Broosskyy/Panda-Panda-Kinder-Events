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
              <Card className="h-full border-border/80" padding="lg">
                <service.icon className="mb-5 h-10 w-10 text-primary" strokeWidth={1.25} aria-hidden />
                <h3 className="text-xl font-semibold text-text-primary">{service.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  {service.description}
                </p>
              </Card>
            </div>
          ))}
        </div>

        {/* Desktop: weiße Karten mit feiner Linie — Mockup-Stil */}
        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4 lg:gap-7">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 60}>
              <Card className="h-full border-border/70 shadow-sm" padding="lg">
                <service.icon className="mb-6 h-9 w-9 text-primary" strokeWidth={1.25} aria-hidden />
                <h3 className="text-lg font-semibold text-text-primary">{service.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
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
