"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { faqs } from "@/lib/faqs";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-bg-secondary py-16 md:py-20">
      <Container>
        <SectionHeading title="Häufige Fragen" subtitle="Antworten auf die wichtigsten Fragen rund um euer Event." />
        <div className="mx-auto max-w-3xl divide-y divide-border">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={faq.question} className="py-5">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 text-left"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium text-text-primary md:text-lg">{faq.question}</span>
                  {isOpen ? (
                    <Minus className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <Plus className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                  )}
                </button>
                <div
                  className={`overflow-hidden transition-all duration-250 ease-in-out ${
                    isOpen ? "mt-3 max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-sm leading-relaxed text-text-secondary md:text-base">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
