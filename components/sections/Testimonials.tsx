"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
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

function ReviewCard({
  review,
  onOpenImage,
}: {
  review: PublicReview;
  onOpenImage?: (item: LightboxItem) => void;
}) {
  const avatarUrl = review.profile_image_url;
  const eventImageUrl = review.event_image_url;

  const openEventImage = () => {
    if (!eventImageUrl || !onOpenImage) return;
    onOpenImage({
      src: eventImageUrl,
      alt: `Eventfoto von ${review.name}`,
      name: review.name,
      rating: review.rating,
      reviewText: review.text,
      category: review.event_type,
      date: formatReviewDate(review.created_at),
    });
  };

  const openAvatarImage = () => {
    if (!avatarUrl || !onOpenImage) return;
    onOpenImage({
      src: avatarUrl,
      alt: review.name,
      name: review.name,
      rating: review.rating,
      reviewText: review.text,
      category: review.event_type,
      date: formatReviewDate(review.created_at),
    });
  };

  return (
    <Card className="review-card flex h-full flex-col" padding="md" hover>
      <StarRating rating={review.rating} size="xl" className="mb-5 sm:mb-7" />

      <blockquote className="flex-1 font-heading text-base leading-relaxed tracking-tight text-text-primary sm:text-lg md:text-xl md:leading-9">
        &ldquo;{review.text}&rdquo;
      </blockquote>

      {eventImageUrl ? (
        <button
          type="button"
          className="relative mt-6 aspect-[16/10] w-full overflow-hidden rounded-xl"
          onClick={openEventImage}
          aria-label={`Eventfoto von ${review.name} vergrößern`}
        >
          <Image
            src={eventImageUrl}
            alt={`Eventfoto von ${review.name}`}
            fill
            className="object-cover transition-transform duration-500 hover:scale-[1.02]"
            sizes="(max-width: 768px) 90vw, 320px"
            unoptimized={eventImageUrl.includes("supabase.co")}
          />
        </button>
      ) : null}

      {review.admin_reply ? (
        <div className="mt-6 rounded-xl border border-primary/15 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Antwort von Panda-Bande</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">{review.admin_reply}</p>
        </div>
      ) : null}

      <div className="mt-7 flex items-center justify-between gap-3 border-t border-border/40 pt-6 sm:mt-9 sm:gap-4 sm:pt-7">
        <div className="flex items-center gap-3 sm:gap-4">
          {avatarUrl ? (
            <button
              type="button"
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-sm sm:h-14 sm:w-14"
              onClick={openAvatarImage}
              aria-label={`Profilbild von ${review.name} vergrößern`}
            >
              <Image
                src={avatarUrl}
                alt={review.name}
                fill
                className="object-cover"
                sizes="56px"
                unoptimized={avatarUrl.includes("supabase.co")}
              />
            </button>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-sm font-semibold text-primary shadow-sm sm:h-14 sm:w-14 sm:text-base">
              {getInitials(review.name)}
            </div>
          )}
          <div>
            <p className="font-semibold text-text-primary">{review.name}</p>
            <p className="text-sm text-text-muted">{review.event_type}</p>
            <p className="mt-1 text-sm text-text-muted">{formatReviewDate(review.created_at)}</p>
          </div>
        </div>
        {review.verified ? (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-3 py-2 text-xs font-semibold text-primary sm:inline-flex">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            Verifizierte Buchung
          </span>
        ) : null}
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
        <span className="font-heading text-4xl font-bold text-text-primary sm:text-5xl md:text-6xl">{displayAverage}</span>
        <span className="text-xl text-text-muted">/ 5</span>
      </div>
      <p className="text-base text-text-muted md:text-lg">
        {count} {count === 1 ? "Bewertung" : "Bewertungen"}
      </p>
    </div>
  );
}

const DESKTOP_VISIBLE = 3;

interface TestimonialsProps {
  reviews: PublicReview[];
  heading?: SiteSectionHeading;
  privacyHint?: string;
}

export function Testimonials({
  reviews,
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
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const desktopMaxIndex = Math.max(0, total - DESKTOP_VISIBLE);
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
            {total > DESKTOP_VISIBLE ? (
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

            <div className="swipe-bleed lg:mx-0 lg:px-0">
              <ul
                className="swipe-track lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible"
                role="list"
                aria-label="Bewertungen"
              >
                {reviews.map((review, index) => {
                  const hiddenOnDesktop =
                    total > DESKTOP_VISIBLE &&
                    (index < desktopIndex || index >= desktopIndex + DESKTOP_VISIBLE);

                  return (
                    <li
                      key={review.id}
                      className={`swipe-item w-[min(90vw,24rem)] sm:w-[min(92vw,26rem)] lg:w-auto ${
                        hiddenOnDesktop ? "lg:hidden" : ""
                      }`}
                    >
                      <ReviewCard review={review} onOpenImage={openLightbox} />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        <div ref={formRef} id="bewertung-form" className="mx-auto mt-10 max-w-xl scroll-mt-24 sm:mt-16 sm:scroll-mt-28">
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
