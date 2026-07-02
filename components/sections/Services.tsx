import { services } from "@/lib/services";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Services() {
  return (
    <section id="leistungen" className="scroll-mt-24 section-padding">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Unsere Leistungen"
            subtitle="Von der Hochzeit bis zum Kindergeburtstag — wir gestalten unvergessliche Momente."
          />
        </ScrollReveal>

        {/* Mobile: horizontal swipe slider */}
        <div
          className="swipe-track -mx-5 px-5 md:hidden"
          role="region"
          aria-label="Leistungen — horizontal scrollen"
        >
          {services.map((service) => (
            <div key={service.title} className="swipe-item w-[min(85vw,20rem)]">
              <Card className="h-full" padding="lg">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-secondary">
                  <service.icon className="h-9 w-9 text-primary" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-xl font-semibold text-text-primary">{service.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">
                  {service.description}
                </p>
              </Card>
            </div>
          ))}
        </div>

        {/* Desktop: 4×2 grid */}
        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, i) => (
            <ScrollReveal key={service.title} delay={i * 60}>
              <Card className="h-full" padding="lg">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-secondary">
                  <service.icon className="h-8 w-8 text-primary" strokeWidth={1.5} aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-text-primary md:text-xl">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary md:text-base md:leading-7">
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
