"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { focusRing } from "@/lib/a11y";
import { Card } from "@/components/ui/Card";
import { ReviewForm } from "@/components/ui/ReviewForm";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PandaMascot } from "@/components/ui/PandaMascot";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface PublicReview {
  id: string;
  name: string;
  event_type: string;
  rating: number;
  text: string;
  created_at: string;
}

function formatReviewDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ReviewCard({ review }: { review: PublicReview }) {
  return (
    <Card className="flex h-full flex-col" padding="md" hover={false}>
      <StarRating rating={review.rating} size="xl" className="mb-4 sm:mb-6" />

      <blockquote className="flex-1 font-heading text-base leading-relaxed text-text-primary sm:text-lg md:text-xl md:leading-9">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/50 pt-5 sm:mt-8 sm:gap-4 sm:pt-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-sm font-semibold text-primary shadow-sm sm:h-14 sm:w-14 sm:text-base">
            {getInitials(review.name)}
          </div>
          <div>
            <p className="font-semibold text-text-primary">{review.name}</p>
            <p className="text-sm text-text-muted">{review.event_type}</p>
            <p className="mt-1 text-sm text-text-muted">{formatReviewDate(review.created_at)}</p>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary sm:inline-flex">
          <BadgeCheck className="h-4 w-4" aria-hidden />
          Verifizierte Buchung
        </span>
      </div>
    </Card>
  );
}

function RatingSummary({ reviews }: { reviews: PublicReview[] }) {
  const count = reviews.length;
  if (count === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  const displayAverage = average.toFixed(1).replace(".", ",");

  return (
    <div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-12 md:mb-16">
      <StarRating rating={5} size="xl" />
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl">
          {displayAverage}
        </span>
        <span className="text-xl text-text-muted">/ 5</span>
      </div>
      <p className="text-base text-text-muted md:text-lg">
        {count} {count === 1 ? "Bewertung" : "Bewertungen"}
      </p>
    </div>
  );
}

const DESKTOP_VISIBLE = 3;

export function Testimonials() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [desktopIndex, setDesktopIndex] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

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
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const desktopMaxIndex = Math.max(0, total - DESKTOP_VISIBLE);
  const visibleDesktop = reviews.slice(desktopIndex, desktopIndex + DESKTOP_VISIBLE);

  const prevDesktop = () => setDesktopIndex((i) => Math.max(0, i - 1));
  const nextDesktop = () => setDesktopIndex((i) => Math.min(desktopMaxIndex, i + 1));

  return (
    <section id="bewertungen" className="scroll-mt-24 section-padding bg-bg-warm/40">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Das sagen Eltern"
            subtitle="Echte Rückmeldungen — freigegeben nach Prüfung durch unser Team."
          />
        </ScrollReveal>

        {loading ? (
          <div className="mx-auto max-w-md space-y-4" aria-live="polite" aria-busy="true">
            <p className="sr-only">Bewertungen werden geladen</p>
            <div className="skeleton mx-auto h-10 w-36 rounded-full" />
            <div className="skeleton h-56 rounded-[var(--radius-card)]" />
          </div>
        ) : (
          <>
            <RatingSummary reviews={reviews} />

            {total === 0 ? (
              <ScrollReveal>
                <Card padding="md" hover={false} className="mx-auto max-w-xl text-center">
                  <PandaMascot size={90} className="mx-auto mb-5 sm:mb-6" />
                  <p className="font-heading text-xl font-bold text-text-primary sm:text-2xl">
                    Noch keine öffentlichen Bewertungen
                  </p>
                  <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-text-secondary sm:mt-4 sm:text-lg">
                    Seid die Ersten — teilt eure Erfahrung mit der Panda-Bande!
                  </p>
                  <Button className="mt-8 w-full shadow-lg sm:mt-10 sm:w-auto" size="lg" onClick={scrollToForm}>
                    Jetzt erste Bewertung abgeben
                  </Button>
                </Card>
              </ScrollReveal>
            ) : (
              <>
                <div className="lg:hidden">
                  <div className="swipe-bleed">
                    <div
                      className="swipe-track"
                      role="region"
                      aria-label="Bewertungen — horizontal scrollen"
                    >
                      {reviews.map((review) => (
                        <div key={review.id} className="swipe-item w-[min(90vw,24rem)] sm:w-[min(92vw,26rem)]">
                          <ReviewCard review={review} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block">
                  <div className="relative">
                    {total > DESKTOP_VISIBLE && (
                      <>
                        <button
                          type="button"
                          onClick={prevDesktop}
                          disabled={desktopIndex === 0}
                          className={`absolute -left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-card shadow-md transition-opacity disabled:opacity-30 ${focusRing}`}
                          aria-label="Vorherige Bewertungen"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={nextDesktop}
                          disabled={desktopIndex >= desktopMaxIndex}
                          className={`absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-bg-card shadow-md transition-opacity disabled:opacity-30 ${focusRing}`}
                          aria-label="Nächste Bewertungen"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <div className="grid gap-8 lg:grid-cols-3">
                      {visibleDesktop.map((review, i) => (
                        <ScrollReveal key={review.id} delay={i * 80}>
                          <ReviewCard review={review} />
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div ref={formRef} id="bewertung-form" className="mx-auto mt-10 max-w-xl scroll-mt-24 sm:mt-16 sm:scroll-mt-28">
          <ScrollReveal>
            <ReviewForm />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
