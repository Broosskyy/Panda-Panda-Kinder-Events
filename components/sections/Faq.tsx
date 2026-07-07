"use client";

import { useId, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs as defaultFaqs } from "@/lib/faqs";
import { resolveSectionHeading } from "@/lib/cms/normalize-settings";
import type { SiteSectionHeading } from "@/lib/cms/types";
import { focusRing } from "@/lib/a11y";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface FaqProps {
  items?: { question: string; answer: string }[];
  heading?: SiteSectionHeading;
}

export function Faq({
  items = defaultFaqs,
  heading,
}: FaqProps) {
  const safeHeading = resolveSectionHeading(heading, "faq");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="section-padding bg-bg-primary" aria-labelledby="faq-heading">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="faq-heading"
            title={safeHeading.title}
            subtitle={safeHeading.subtitle}
          />
        </ScrollReveal>
        <div className="faq-list section-container--narrow divide-y divide-border/80" role="list">
          {items.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `${baseId}-faq-${index}`;
            const panelId = `${baseId}-faq-panel-${index}`;

            return (
              <div key={faq.question} className={`faq-item py-5 sm:py-6 ${isOpen ? "is-open" : ""}`} role="listitem">
                <button
                  id={buttonId}
                  type="button"
                  className={`flex w-full items-center justify-between gap-4 text-left ${focusRing}`}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span className="font-heading text-base font-semibold tracking-tight text-text-primary sm:text-lg md:text-xl">
                    {faq.question}
                  </span>
                  <span className="faq-toggle" aria-hidden>
                    {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={`faq-panel grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "faq-panel-open" : "faq-panel-closed"}`}
                >
                  <div className="overflow-hidden" aria-hidden={!isOpen}>
                    <p className="pb-1 pt-4 max-w-prose text-base leading-relaxed text-text-secondary sm:pt-5 sm:text-lg sm:leading-8">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
