"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Card } from "@/components/ui/Card";
import { ReviewForm } from "@/components/ui/ReviewForm";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
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
    <Card className="flex h-full flex-col" padding="lg" hover={false}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-sm font-semibold text-primary">
            {getInitials(review.name)}
          </div>
          <div>
            <p className="font-semibold text-text-primary">{review.name}</p>
            <p className="text-sm text-text-muted">{review.event_type}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
          Verifizierte Buchung
        </span>
      </div>

      <StarRating rating={review.rating} size="lg" className="mb-4" />

      <blockquote className="flex-1 text-base leading-relaxed text-text-secondary">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      <p className="mt-5 text-sm text-text-muted">{formatReviewDate(review.created_at)}</p>
    </Card>
  );
}

function RatingSummary({ reviews }: { reviews: PublicReview[] }) {
  const count = reviews.length;
  if (count === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  const displayAverage = average.toFixed(1).replace(".", ",");

  return (
    <div className="mb-10 flex flex-col items-center gap-3 text-center md:mb-14">
      <StarRating rating={5} size="lg" />
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-4xl font-bold text-text-primary md:text-5xl">
          {displayAverage}
        </span>
        <span className="text-lg text-text-muted">/ 5</span>
      </div>
      <p className="text-sm text-text-muted md:text-base">
        {count} {count === 1 ? "Bewertung" : "Bewertungen"}
      </p>
    </div>
  );
}

export function Testimonials() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <section id="bewertungen" className="scroll-mt-24 section-padding bg-bg-secondary/30">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Das sagen Eltern"
            subtitle="Echte Rückmeldungen — freigegeben nach Prüfung durch unser Team."
          />
        </ScrollReveal>

        {loading ? (
          <div className="mx-auto max-w-md space-y-4">
            <div className="skeleton mx-auto h-8 w-32 rounded-full" />
            <div className="skeleton h-48 rounded-[var(--radius-card)]" />
          </div>
        ) : (
          <>
            <RatingSummary reviews={reviews} />

            {total === 0 ? (
              <ScrollReveal>
                <div className="mx-auto max-w-xl text-center">
                  <Card padding="lg" hover={false}>
                    <p className="text-lg text-text-secondary">
                      Noch keine öffentlichen Bewertungen vorhanden.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted md:text-base">
                      Seid die Ersten — teilt eure Erfahrung mit der Panda-Bande!
                    </p>
                    <Button className="mt-8 w-full sm:w-auto" size="lg" onClick={scrollToForm}>
                      Jetzt erste Bewertung abgeben
                    </Button>
                  </Card>
                </div>
              </ScrollReveal>
            ) : (
              <>
                {/* Mobile swipe */}
                <div className="lg:hidden">
                  <div className="swipe-track -mx-5 px-5">
                    {reviews.map((review) => (
                      <div key={review.id} className="swipe-item w-[min(90vw,24rem)]">
                        <ReviewCard review={review} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: 3 cards */}
                <div className="hidden gap-6 lg:grid lg:grid-cols-3">
                  {reviews.slice(0, 3).map((review, i) => (
                    <ScrollReveal key={review.id} delay={i * 100}>
                      <ReviewCard review={review} />
                    </ScrollReveal>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div ref={formRef} id="bewertung-form" className="mx-auto mt-14 max-w-xl scroll-mt-28">
          <ScrollReveal>
            <ReviewForm />
          </ScrollReveal>
        </div>
      </Container>
    </section>
  );
}
