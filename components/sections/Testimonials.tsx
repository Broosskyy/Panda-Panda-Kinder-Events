"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { focusRing } from "@/lib/a11y";
import type { PublicReview, SiteSectionHeading } from "@/lib/cms/types";
import { resolveSectionHeading } from "@/lib/cms/normalize-settings";
import { Card } from "@/components/ui/Card";
import { ReviewForm } from "@/components/ui/ReviewForm";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/Logo";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PublicReviewCard } from "@/components/reviews/PublicReviewCard";
import { formatReviewDate } from "@/components/reviews/PublicReviewCard";

function RatingSummary({ reviews }: { reviews: PublicReview[] }) {
  const count = reviews.length;
  if (count === 0) return null;

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / count;
  const displayAverage = average.toFixed(1).replace(".", ",");
  const displayStars = Math.round(average * 2) / 2;

  return (
    <div className="mb-5 flex flex-col items-center gap-3 text-center sm:mb-12 md:mb-16">
      <StarRating rating={displayStars} size="xl" />
      <div className="flex items-baseline gap-2">
        <span className="font-heading text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl">{displayAverage}</span>
        <span className="text-xl text-text-muted">/ 5</span>
      </div>
      <p className="text-base text-text-muted md:text-lg">
        {count} {count === 1 ? "Bewertung" : "Bewertungen"}
      </p>
    </div>
  );
}

export const HOME_REVIEWS_PREVIEW_LIMIT = 3;

interface TestimonialsProps {
  reviews: PublicReview[];
  totalReviewCount?: number;
  heading?: SiteSectionHeading;
  privacyHint?: string;
}

export function Testimonials({
  reviews,
  totalReviewCount,
  heading,
  privacyHint,
}: TestimonialsProps) {
  const safeHeading = resolveSectionHeading(heading, "testimonials");
  const [desktopIndex, setDesktopIndex] = useState(0);
  const [lightboxItems, setLightboxItems] = useState<LightboxItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const openLightbox = (item: LightboxItem) => {
    const galleryItems = reviews.flatMap((review) => {
      const items: LightboxItem[] = [];
      if (review.event_image_url) {
        items.push({
          src: review.event_image_url,
          alt: `Eventfoto von ${review.name}`,
          name: review.name,
          rating: review.rating,
          reviewText: review.text,
          category: review.event_type,
          date: formatReviewDate(review.created_at),
        });
      }
      return items;
    });
    const idx = galleryItems.findIndex((i) => i.src === item.src && i.name === item.name);
    setLightboxItems(galleryItems.length > 0 ? galleryItems : [item]);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  const total = reviews.length;
  const publishedTotal = totalReviewCount ?? total;
  const showAllLink = publishedTotal > HOME_REVIEWS_PREVIEW_LIMIT;
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const desktopMaxIndex = Math.max(0, total - HOME_REVIEWS_PREVIEW_LIMIT);
  const prevDesktop = () => setDesktopIndex((i) => Math.max(0, i - 1));
  const nextDesktop = () => setDesktopIndex((i) => Math.min(desktopMaxIndex, i + 1));

  return (
    <section id="bewertungen" className="section-padding section-warm">
      <Container>
        <ScrollReveal>
          <SectionHeading title={safeHeading.title} subtitle={safeHeading.subtitle} />
        </ScrollReveal>

        <RatingSummary reviews={reviews} />

        {total === 0 ? (
          <ScrollReveal>
            <Card padding="lg" hover={false} className="review-card mx-auto max-w-xl text-center">
              <BrandMark className="mx-auto mb-6 opacity-90" />
              <p className="font-heading text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
                Noch keine öffentlichen Bewertungen
              </p>
              <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-text-secondary sm:text-lg">
                Seid die Ersten — teilt eure Erfahrung mit der Panda-Bande!
              </p>
              <Button className="mt-9 w-full shadow-lg sm:mt-10 sm:w-auto" size="lg" onClick={scrollToForm}>
                Jetzt erste Bewertung abgeben
              </Button>
            </Card>
          </ScrollReveal>
        ) : (
          <div className="relative">
            {total > HOME_REVIEWS_PREVIEW_LIMIT ? (
              <>
                <button
                  type="button"
                  onClick={prevDesktop}
                  disabled={desktopIndex === 0}
                  className={`absolute -left-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-bg-card shadow-md transition-all duration-500 hover:border-primary/20 hover:shadow-lg disabled:opacity-30 lg:flex ${focusRing}`}
                  aria-label="Vorherige Bewertungen"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={nextDesktop}
                  disabled={desktopIndex >= desktopMaxIndex}
                  className={`absolute -right-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-bg-card shadow-md transition-all duration-500 hover:border-primary/20 hover:shadow-lg disabled:opacity-30 lg:flex ${focusRing}`}
                  aria-label="Nächste Bewertungen"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            <div className="swipe-bleed swipe-bleed-reset-lg">
              <ul
                className="swipe-track lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible"
                role="list"
                aria-label="Bewertungen"
              >
                {reviews.map((review, index) => {
                  const hiddenOnDesktop =
                    total > HOME_REVIEWS_PREVIEW_LIMIT &&
                    (index < desktopIndex || index >= desktopIndex + HOME_REVIEWS_PREVIEW_LIMIT);

                  return (
                    <li
                      key={review.id}
                      className={`swipe-item swipe-item-card md:w-auto lg:w-auto ${
                        hiddenOnDesktop ? "lg:hidden" : ""
                      }`}
                    >
                      <PublicReviewCard review={review} onOpenImage={openLightbox} />
                    </li>
                  );
                })}
              </ul>
            </div>

            {showAllLink ? (
              <div className="mt-10 flex justify-center sm:mt-12">
                <Button href="/bewertungen" variant="secondary" size="lg">
                  Alle {publishedTotal} Bewertungen anzeigen
                </Button>
              </div>
            ) : null}
          </div>
        )}

        <div
          ref={formRef}
          id="bewertung-form"
          className="review-form-shell section-container--narrow form-chrome-safe section-content-gap"
        >
          <ScrollReveal>
            <ReviewForm privacyHint={privacyHint} />
          </ScrollReveal>
        </div>
      </Container>

      {lightboxItems.length > 0 ? (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxItems([])}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </section>
  );
}
