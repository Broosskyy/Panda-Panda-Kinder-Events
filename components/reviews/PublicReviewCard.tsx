"use client";

import Image from "next/image";
import { BadgeCheck } from "lucide-react";
import type { PublicReview } from "@/lib/cms/types";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import type { LightboxItem } from "@/components/ui/Lightbox";

export function formatReviewDate(dateStr: string) {
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

interface PublicReviewCardProps {
  review: PublicReview;
  onOpenImage?: (item: LightboxItem) => void;
  replyLabel?: string;
}

export function PublicReviewCard({ review, onOpenImage, replyLabel = "Antwort von Panda-Bande" }: PublicReviewCardProps) {
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
      <StarRating rating={review.rating} size="xl" className="mb-5 justify-center sm:mb-7 sm:justify-start" />

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
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">{replyLabel}</p>
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
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1.5 text-[0.6875rem] font-semibold text-primary sm:px-3 sm:py-2 sm:text-xs">
            <BadgeCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
            <span className="sr-only sm:not-sr-only">Verifiziert</span>
          </span>
        ) : null}
      </div>
    </Card>
  );
}
