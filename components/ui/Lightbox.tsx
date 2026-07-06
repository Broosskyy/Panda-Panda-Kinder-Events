"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { focusRing } from "@/lib/a11y";
import { StarRating } from "@/components/ui/StarRating";

export interface LightboxItem {
  src: string;
  alt: string;
  title?: string;
  category?: string;
  description?: string;
  name?: string;
  rating?: number;
  reviewText?: string;
}

interface LightboxProps {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}

export function Lightbox({ items, index, onClose, onIndexChange }: LightboxProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [current, setCurrent] = useState(index);

  const item = items[current];
  const hasMultiple = items.length > 1;

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, next));
      setCurrent(clamped);
      onIndexChange?.(clamped);
    },
    [items.length, onIndexChange],
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    setCurrent(index);
  }, [index]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  return (
    <div
      className="lightbox-root fixed inset-0 z-[80] flex items-end justify-center bg-text-primary/90 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="sr-only">
        Bildansicht: {item.alt}
      </p>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className={`absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 sm:right-4 sm:top-4 sm:h-12 sm:w-12 ${focusRing}`}
        aria-label="Bildansicht schließen"
      >
        <X className="h-6 w-6" aria-hidden />
      </button>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            disabled={current === 0}
            className={`absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-30 sm:flex ${focusRing}`}
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            disabled={current >= items.length - 1}
            className={`absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 disabled:opacity-30 sm:flex ${focusRing}`}
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}

      <div
        className="lightbox-panel relative flex max-h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl bg-bg-card sm:max-h-[90vh] sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null || !hasMultiple) return;
          const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (Math.abs(delta) > 48) {
            if (delta < 0) next();
            else prev();
          }
          touchStartX.current = null;
        }}
      >
        <div className="relative min-h-[40dvh] max-h-[65dvh] w-full flex-1 bg-bg-secondary sm:min-h-[20rem] sm:max-h-[70vh]">
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, 896px"
            unoptimized={item.src.includes("supabase.co")}
            priority
          />
        </div>

        <div className="shrink-0 border-t border-border/60 px-4 py-4 sm:px-6 sm:py-5">
          {item.name ? (
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <p className="font-heading text-lg font-bold text-text-primary">{item.name}</p>
              {typeof item.rating === "number" ? <StarRating rating={item.rating} size="sm" /> : null}
            </div>
          ) : null}
          {item.title ? <p className="font-semibold text-text-primary">{item.title}</p> : null}
          {item.category ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">{item.category}</p>
          ) : null}
          {item.description ? (
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
          ) : null}
          {item.reviewText ? (
            <blockquote className="mt-2 text-sm leading-relaxed text-text-secondary sm:text-base">
              &ldquo;{item.reviewText}&rdquo;
            </blockquote>
          ) : null}
          {hasMultiple ? (
            <p className="mt-3 text-xs text-text-muted">
              {current + 1} / {items.length}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
