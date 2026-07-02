import { usps } from "@/lib/usps";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Usps() {
  return (
    <section className="scroll-mt-24 py-16 md:py-20">
      <Container>
        <SectionHeading
          title="Warum Panda-Bande?"
          subtitle="Wir verbinden professionelle Betreuung mit echter Herzlichkeit."
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {usps.map((usp) => (
            <div
              key={usp.title}
              className="rounded-2xl border border-border bg-bg-card p-6 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-hover sm:text-left"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary sm:mx-0">
                <usp.icon className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="text-lg font-semibold text-text-primary">{usp.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{usp.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
