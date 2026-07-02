import Image from "next/image";
import { processSteps } from "@/lib/process-steps";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Process() {
  return (
    <section id="ablauf" className="scroll-mt-24 section-padding bg-bg-secondary/40">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="So einfach buchst du uns"
            subtitle="In fünf Schritten zu eurem unvergesslichen Event."
          />
        </ScrollReveal>

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
          {/* Mobile: vertical timeline */}
          <div className="relative lg:hidden">
            <div className="timeline-line" aria-hidden />
            <div className="space-y-8">
              {processSteps.map((step) => (
                <div key={step.number} className="relative flex gap-5 pl-1">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-text-inverse shadow-md">
                    {step.number}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="mb-2 flex items-center gap-2">
                      <step.icon className="h-5 w-5 text-primary" strokeWidth={1.5} aria-hidden />
                      <h3 className="text-base font-semibold text-text-primary">{step.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-text-secondary">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: horizontal 5-step timeline */}
          <div className="hidden lg:block">
            <div className="flex items-start justify-between gap-2">
              {processSteps.map((step, index) => (
                <div key={step.number} className="relative flex flex-1 flex-col items-center text-center">
                  {index < processSteps.length - 1 && (
                    <div
                      className="absolute left-[calc(50%+1.25rem)] top-5 h-px w-[calc(100%-2.5rem)] border-t-2 border-dashed border-primary/30"
                      aria-hidden
                    />
                  )}
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-text-inverse shadow-md">
                    {step.number}
                  </div>
                  <step.icon className="mt-4 h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden />
                  <h3 className="mt-3 text-sm font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 px-1 text-xs leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ScrollReveal delay={200} className="relative mx-auto w-56 xl:w-64">
            <Image
              src="/panda-illustration.svg"
              alt="Panda-Maskottchen der Panda-Bande"
              width={256}
              height={280}
              className="w-full"
            />
            <div className="absolute -top-2 right-0 max-w-[200px] rounded-[var(--radius-card)] rounded-br-sm border border-border/50 bg-bg-card px-5 py-4 text-sm leading-relaxed shadow-lg">
              Wir kümmern uns um den Rest!{" "}
              <span className="text-accent-heart" aria-hidden>
                ♡
              </span>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
