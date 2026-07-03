import Image from "next/image";
import { processSteps } from "@/lib/process-steps";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Process() {
  return (
    <section id="ablauf" className="scroll-mt-24 section-padding bg-bg-warm/40">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="So einfach buchst du uns"
            subtitle="In fünf Schritten zu eurem unvergesslichen Event."
          />
        </ScrollReveal>

        <div className="grid items-center gap-14 lg:grid-cols-[1fr_auto] lg:gap-20">
          <div className="relative lg:hidden">
            <div className="timeline-line" aria-hidden />
            <div className="space-y-10">
              {processSteps.map((step, i) => (
                <ScrollReveal key={step.number} delay={i * 80}>
                  <div className="relative flex gap-6 pl-1">
                    <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-text-inverse shadow-lg">
                      {step.number}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="mb-2 flex items-center gap-3">
                        <step.icon className="h-6 w-6 text-primary" strokeWidth={1.25} aria-hidden />
                        <h3 className="text-lg font-semibold text-text-primary">{step.title}</h3>
                      </div>
                      <p className="text-base leading-relaxed text-text-secondary">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="flex items-start justify-between gap-3">
              {processSteps.map((step, index) => (
                <ScrollReveal key={step.number} delay={index * 100} className="relative flex flex-1 flex-col items-center text-center">
                  {index < processSteps.length - 1 && (
                    <div className="absolute left-[calc(50%+1.5rem)] top-6 flex w-[calc(100%-3rem)] items-center" aria-hidden>
                      <div className="h-px flex-1 border-t-2 border-dashed border-primary/25" />
                      <div className="mx-1 h-1.5 w-1.5 rounded-full bg-primary/30" />
                      <div className="h-px flex-1 border-t-2 border-dashed border-primary/25" />
                    </div>
                  )}
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-base font-semibold text-text-inverse shadow-lg">
                    {step.number}
                  </div>
                  <step.icon className="mt-5 h-7 w-7 text-primary" strokeWidth={1.25} aria-hidden />
                  <h3 className="mt-4 text-base font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 px-2 text-sm leading-relaxed text-text-secondary">
                    {step.description}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <ScrollReveal delay={200} className="relative mx-auto w-60 xl:w-72">
            <Image
              src="/panda-illustration.svg"
              alt="Panda-Maskottchen der Panda-Bande"
              width={288}
              height={316}
              className="w-full drop-shadow-lg"
            />
            <div className="absolute -top-3 right-0 max-w-[220px] rounded-[var(--radius-card)] rounded-br-md border border-white/50 bg-bg-card/95 px-6 py-5 text-base leading-relaxed shadow-float backdrop-blur-sm">
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
