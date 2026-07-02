"use client";

import { useId, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs } from "@/lib/faqs";
import { focusRing } from "@/lib/a11y";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="scroll-mt-24 section-padding bg-bg-secondary" aria-labelledby="faq-heading">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="faq-heading"
            title="Häufige Fragen"
            subtitle="Antworten auf die wichtigsten Fragen rund um euer Event."
          />
        </ScrollReveal>
        <div className="mx-auto max-w-3xl space-y-3" role="list">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const buttonId = `${baseId}-faq-${index}`;
            const panelId = `${baseId}-faq-panel-${index}`;

            return (
              <ScrollReveal key={faq.question} delay={index * 50}>
                <div role="listitem">
                <Card className="overflow-hidden" padding="sm" hover={false}>
                  <h3 className="m-0">
                    <button
                      id={buttonId}
                      type="button"
                      className={`flex w-full min-h-12 items-center justify-between gap-4 py-3 text-left ${focusRing}`}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                    >
                      <span className="text-base font-medium text-text-primary md:text-lg">
                        {faq.question}
                      </span>
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-primary transition-colors"
                        aria-hidden
                      >
                        {isOpen ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
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
                      <p className="pb-3 text-base leading-relaxed text-text-secondary md:leading-7">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </Card>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
