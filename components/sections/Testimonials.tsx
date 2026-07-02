"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { testimonials } from "@/lib/testimonials";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const total = testimonials.length;
  const item = testimonials[current];

  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setCurrent((c) => (c === total - 1 ? 0 : c + 1));

  return (
    <section id="bewertungen" className="scroll-mt-24 py-16 md:py-20">
      <Container>
        <SectionHeading title="Das sagen Eltern" subtitle="Echte Rückmeldungen von zufriedenen Familien." />
        <div className="mx-auto max-w-3xl lg:hidden">
          <article className="rounded-2xl bg-bg-card p-8 shadow-md">
            <div className="mb-4 flex justify-center gap-0.5" aria-label={`${item.stars} von 5 Sternen`}>
              {Array.from({ length: item.stars }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-accent-gold text-accent-gold" />
              ))}
            </div>
            <blockquote className="text-center text-base leading-relaxed text-text-secondary md:text-lg">
              &ldquo;{item.text}&rdquo;
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              {item.image && (
                <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm">
                  <Image src={item.image} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="text-center sm:text-left">
                <p className="font-semibold text-text-primary">{item.author}</p>
                <p className="text-sm text-text-muted">{item.event}</p>
              </div>
            </div>
          </article>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prev}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg-card transition-colors hover:bg-bg-secondary"
              aria-label="Vorherige Bewertung"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === current ? "bg-primary" : "bg-border"
                  }`}
                  aria-label={`Bewertung ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={next}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg-card transition-colors hover:bg-bg-secondary"
              aria-label="Nächste Bewertung"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {testimonials.slice(0, 3).map((t) => (
            <article key={t.author} className="rounded-2xl bg-bg-card p-6 shadow-md">
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent-gold text-accent-gold" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-text-secondary">&ldquo;{t.text}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                {t.image && (
                  <div className="relative h-10 w-10 overflow-hidden rounded-full">
                    <Image src={t.image} alt="" fill className="object-cover" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.author}</p>
                  <p className="text-xs text-text-muted">{t.event}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
