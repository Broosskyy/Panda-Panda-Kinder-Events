import Image from "next/image";
import { processSteps } from "@/lib/process-steps";
import { ICON_STROKE } from "@/lib/design";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Process() {
  return (
    <section id="ablauf" className="scroll-mt-24 section-padding section-warm">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="So einfach buchst du uns"
            subtitle="In fünf Schritten zu eurem unvergesslichen Event."
          />
        </ScrollReveal>

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-24">
          <div className="relative lg:hidden">
            <div className="timeline-line" aria-hidden />
            <div className="space-y-10">
              {processSteps.map((step, i) => (
                <ScrollReveal key={step.number} delay={i * 80}>
                  <div className="relative flex gap-5 pl-1">
                    <div className="step-circle relative z-10 h-11 w-11 shrink-0 text-sm sm:h-12 sm:w-12 sm:text-base">
                      {step.number}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="mb-2 flex items-center gap-3">
                        <step.icon className="h-5 w-5 text-primary sm:h-6 sm:w-6" strokeWidth={ICON_STROKE} aria-hidden />
                        <h3 className="text-base font-semibold text-text-primary sm:text-lg">{step.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-text-secondary sm:text-base sm:leading-7">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="flex items-start justify-between gap-4">
              {processSteps.map((step, index) => (
                <ScrollReveal
                  key={step.number}
                  delay={index * 100}
                  className="group relative flex flex-1 flex-col items-center px-2 text-center"
                >
                  {index < processSteps.length - 1 && (
                    <div
                      className="absolute left-[calc(50%+1.75rem)] top-6 flex w-[calc(100%-3.5rem)] items-center"
                      aria-hidden
                    >
                      <div className="h-px flex-1 border-t border-dashed border-primary/20" />
                      <div className="mx-1.5 h-1 w-1 rounded-full bg-primary/25" />
                      <div className="h-px flex-1 border-t border-dashed border-primary/20" />
                    </div>
                  )}
                  <div className="step-circle relative z-10 h-12 w-12 text-base">{step.number}</div>
                  <step.icon
                    className="mt-6 h-7 w-7 text-primary transition-transform duration-500 group-hover:scale-110"
                    strokeWidth={ICON_STROKE}
                    aria-hidden
                  />
                  <h3 className="mt-5 text-base font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{step.description}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <ScrollReveal delay={200} className="relative mx-auto w-52 sm:w-64 xl:w-72">
            <Image
              src="/panda-illustration.svg"
              alt="Panda-Maskottchen der Panda-Bande"
              width={288}
              height={316}
              className="w-full drop-shadow-xl"
            />
            <div className="absolute -top-3 right-0 max-w-[min(100%,13rem)] rounded-[var(--radius-card)] rounded-br-md border border-white/60 bg-bg-card/95 px-5 py-4 text-sm leading-relaxed shadow-float backdrop-blur-md sm:max-w-[220px] sm:px-6 sm:py-5 sm:text-base">
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
