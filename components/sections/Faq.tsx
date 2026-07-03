"use client";

import { useId, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs } from "@/lib/faqs";
import { focusRing } from "@/lib/a11y";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="scroll-mt-24 section-padding bg-bg-primary" aria-labelledby="faq-heading">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="faq-heading"
            title="Häufige Fragen"
            subtitle="Antworten auf die wichtigsten Fragen rund um euer Event."
          />
        </ScrollReveal>
        <div className="mx-auto max-w-3xl divide-y divide-border/80" role="list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `${baseId}-faq-${index}`;
            const panelId = `${baseId}-faq-panel-${index}`;

            return (
              <ScrollReveal key={faq.question} delay={index * 50}>
                <div role="listitem" className={`faq-item py-2 ${isOpen ? "is-open" : ""}`}>
                  <h3 className="m-0">
                    <button
                      id={buttonId}
                      type="button"
                      className={`flex w-full min-h-14 items-center justify-between gap-5 rounded-2xl px-2 py-5 text-left transition-colors sm:px-4 ${focusRing}`}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                    >
                      <span className="text-lg font-medium leading-snug text-text-primary md:text-xl">
                        {faq.question}
                      </span>
                      <span className="faq-toggle" aria-hidden>
                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!isOpen}
                    className={`faq-content ${isOpen ? "open" : ""}`}
                  >
                    <div>
                      <p className="px-2 pb-7 text-base leading-relaxed text-text-secondary sm:px-4 md:text-lg md:leading-8">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
