"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { siteConfig } from "@/config/site";
import { ReviewForm } from "@/components/ui/ReviewForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface PublicReview {
  id: string;
  name: string;
  event_type: string;
  rating: number;
  text: string;
  created_at: string;
}

export function Testimonials() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        let approved: PublicReview[] = data.reviews ?? [];
        if (approved.length === 0 && siteConfig.reviews.showDemoReviews) {
          approved = siteConfig.reviews.demoData.map((d, i) => ({
            id: `demo-${i}`,
            name: d.author,
            event_type: d.event,
            rating: d.stars,
            text: d.text,
            created_at: new Date().toISOString(),
          }));
        }
        setReviews(approved);
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const total = reviews.length;
  const item = reviews[current];

  const prev = () => setCurrent((c) => (c === 0 ? total - 1 : c - 1));
  const next = () => setCurrent((c) => (c === total - 1 ? 0 : c + 1));

  return (
    <section id="bewertungen" className="scroll-mt-24 py-12 md:py-20">
      <Container>
        <SectionHeading
          title="Das sagen Eltern"
          subtitle="Echte Rückmeldungen — freigegeben nach Prüfung durch unser Team."
        />

        {loading ? (
          <p className="text-center text-text-muted">Bewertungen werden geladen...</p>
        ) : total === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-bg-card p-8 text-center">
            <p className="text-text-secondary">Noch keine öffentlichen Bewertungen vorhanden.</p>
            <p className="mt-2 text-sm text-text-muted">
              Seid die Ersten — teilt eure Erfahrung mit der Panda-Bande!
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto max-w-3xl lg:hidden">
              <article className="rounded-2xl bg-bg-card p-6 shadow-md sm:p-8">
                <div
                  className="mb-4 flex justify-center gap-0.5"
                  aria-label={`${item.rating} von 5 Sternen`}
                >
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent-gold text-accent-gold" />
                  ))}
                </div>
                <blockquote className="text-center text-base leading-relaxed text-text-secondary">
                  &ldquo;{item.text}&rdquo;
                </blockquote>
                <div className="mt-6 text-center">
                  <p className="font-semibold text-text-primary">{item.name}</p>
                  <p className="text-sm text-text-muted">{item.event_type}</p>
                </div>
              </article>
              {total > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={prev}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-card"
                    aria-label="Vorherige Bewertung"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-text-muted">
                    {current + 1} / {total}
                  </span>
                  <button
                    type="button"
                    onClick={next}
                    className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-bg-card"
                    aria-label="Nächste Bewertung"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            <div className="hidden gap-6 lg:grid lg:grid-cols-3">
              {reviews.slice(0, 3).map((t) => (
                <article key={t.id} className="rounded-2xl bg-bg-card p-6 shadow-md">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent-gold text-accent-gold" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-text-secondary">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-muted">{t.event_type}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        <div className="mx-auto mt-10 max-w-xl">
          <ReviewForm />
        </div>
      </Container>
    </section>
  );
}
