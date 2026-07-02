"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs } from "@/lib/faqs";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 section-padding bg-bg-secondary">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Häufige Fragen"
            subtitle="Antworten auf die wichtigsten Fragen rund um euer Event."
          />
        </ScrollReveal>
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <ScrollReveal key={faq.question} delay={index * 50}>
                <Card className="overflow-hidden" padding="sm" hover={false}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-2 text-left"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-base font-medium text-text-primary md:text-lg">
                      {faq.question}
                    </span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-primary transition-colors">
                      {isOpen ? (
                        <Minus className="h-5 w-5" aria-hidden />
                      ) : (
                        <Plus className="h-5 w-5" aria-hidden />
                      )}
                    </span>
                  </button>
                  <div className={`faq-content ${isOpen ? "open" : ""}`}>
                    <div>
                      <p className="pb-2 text-sm leading-relaxed text-text-secondary md:text-base md:leading-7">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
