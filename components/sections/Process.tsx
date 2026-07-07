import { BrandMark } from "@/components/ui/Logo";
import { ICON_STROKE } from "@/lib/design";
import type { SiteProcessSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { resolveSectionHeading } from "@/lib/cms/normalize-settings";
import { resolveContentIcon } from "@/lib/cms/icons";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface ProcessProps {
  process?: SiteProcessSettings;
  heading?: { title: string; subtitle: string };
}

export function Process({
  process = DEFAULT_SITE_SETTINGS.process,
  heading,
}: ProcessProps) {
  const safeHeading = resolveSectionHeading(heading, "process");
  const steps = process.steps?.length ? process.steps : DEFAULT_SITE_SETTINGS.process.steps;

  return (
    <section id="ablauf" className="section-padding section-warm">
      <Container>
        <ScrollReveal>
          <SectionHeading title={safeHeading.title} subtitle={safeHeading.subtitle} />
        </ScrollReveal>

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-24">
          <div className="relative">
            <div className="timeline-line lg:hidden" aria-hidden />
            <ol
              className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-4"
              role="list"
            >
              {steps.map((step, index) => {
                const Icon = resolveContentIcon(step.iconKey);
                return (
                  <li
                    key={step.number}
                    className="group relative flex flex-1 flex-col lg:items-center lg:px-2 lg:text-center"
                  >
                    {index < steps.length - 1 ? (
                      <div
                        className="absolute left-[1.375rem] top-12 hidden h-[calc(100%+2.5rem)] w-px bg-primary/15 lg:left-[calc(50%+1.75rem)] lg:top-6 lg:flex lg:h-auto lg:w-[calc(100%-3.5rem)] lg:items-center"
                        aria-hidden
                      >
                        <div className="h-full w-px border-l border-dashed border-primary/20 lg:h-px lg:w-full lg:border-l-0 lg:border-t" />
                      </div>
                    ) : null}

                    <ScrollReveal delay={index * 80} className="relative z-10 w-full lg:flex lg:flex-col lg:items-center">
                      <div className="process-step-row flex gap-5 pl-1 lg:flex-col lg:items-center lg:pl-0">
                        <div className="step-circle relative z-10 h-11 w-11 shrink-0 text-sm sm:h-12 sm:w-12 sm:text-base lg:h-12 lg:w-12">
                          {step.number}
                        </div>
                        <div className="process-step-body flex-1 pb-2 lg:pb-0">
                          <div className="process-step-icon-row mb-2 flex items-center gap-3 lg:mb-0 lg:mt-6 lg:flex-col lg:gap-0">
                            <Icon
                              className="h-5 w-5 text-primary sm:h-6 sm:w-6 lg:mt-6 lg:h-7 lg:w-7 lg:transition-transform lg:duration-500 lg:group-hover:scale-110"
                              strokeWidth={ICON_STROKE}
                              aria-hidden
                            />
                            <h3 className="text-base font-semibold text-text-primary sm:text-lg lg:mt-5">{step.title}</h3>
                          </div>
                          <p className="text-sm leading-relaxed text-text-secondary sm:text-base sm:leading-7 lg:mt-2.5">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  </li>
                );
              })}
            </ol>
          </div>

          <ScrollReveal delay={200} className="relative mx-auto w-52 sm:w-64 xl:w-72">
            <BrandMark className="mx-auto w-full justify-center" />
            <div className="absolute -top-3 right-0 max-w-[min(100%,13rem)] rounded-[var(--radius-card)] rounded-br-md border border-white/60 bg-bg-card/95 px-5 py-4 text-sm leading-relaxed shadow-float backdrop-blur-md sm:max-w-[220px] sm:px-6 sm:py-5 sm:text-base">
              {process.speechBubble}{" "}
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
