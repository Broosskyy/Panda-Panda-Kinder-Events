"use client";

import { useState } from "react";
import type { PublicReview } from "@/lib/cms/types";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { PublicReviewCard, formatReviewDate } from "@/components/reviews/PublicReviewCard";

interface ReviewsPageGridProps {
  reviews: PublicReview[];
  className?: string;
}

export function ReviewsPageGrid({ reviews, className = "" }: ReviewsPageGridProps) {
  const [lightboxItems, setLightboxItems] = useState<LightboxItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (item: LightboxItem) => {
    const galleryItems = reviews.flatMap((review) => {
      if (!review.event_image_url) return [];
      return [
        {
          src: review.event_image_url,
          alt: `Eventfoto von ${review.name}`,
          name: review.name,
          rating: review.rating,
          reviewText: review.text,
          category: review.event_type,
          date: formatReviewDate(review.created_at),
        },
      ];
    });
    const idx = galleryItems.findIndex((i) => i.src === item.src && i.name === item.name);
    setLightboxItems(galleryItems.length > 0 ? galleryItems : [item]);
    setLightboxIndex(idx >= 0 ? idx : 0);
  };

  return (
    <>
      <ul className={`grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 ${className}`} role="list">
        {reviews.map((review) => (
          <li key={review.id} className="flex">
            <PublicReviewCard review={review} onOpenImage={openLightbox} />
          </li>
        ))}
      </ul>

      {lightboxItems.length > 0 ? (
        <Lightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxItems([])}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </>
  );
}
