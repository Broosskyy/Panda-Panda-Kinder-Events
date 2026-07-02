import { services } from "@/lib/services";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Services() {
  return (
    <section id="leistungen" className="scroll-mt-24 py-16 md:py-20">
      <Container>
        <SectionHeading
          title="Unsere Leistungen"
          subtitle="Von der Hochzeit bis zum Kindergeburtstag — wir gestalten unvergessliche Momente."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-2xl border border-border bg-bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover"
            >
              <service.icon className="mb-4 h-8 w-8 text-primary" strokeWidth={1.5} aria-hidden />
              <h3 className="text-lg font-semibold text-text-primary">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{service.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
