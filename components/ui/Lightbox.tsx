"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Loader2, X, ZoomIn, ZoomOut } from "lucide-react";
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
  date?: string;
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
  const [zoomed, setZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const item = items[current];
  const hasMultiple = items.length > 1;
  const hasCaption = Boolean(
    item?.name || item?.title || item?.category || item?.description || item?.reviewText || item?.date,
  );

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, next));
      setCurrent(clamped);
      setZoomed(false);
      setImageLoaded(false);
      onIndexChange?.(clamped);
    },
    [items.length, onIndexChange],
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    setCurrent(index);
    setZoomed(false);
    setImageLoaded(false);
  }, [index]);

  useEffect(() => {
    document.body.classList.add("lightbox-open");
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("lightbox-open");
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, prev, next]);

  if (!item) return null;

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="sr-only">
        Bildansicht: {item.alt}
      </p>

      <div className="lightbox-toolbar" onClick={(e) => e.stopPropagation()}>
        {hasMultiple ? (
          <span className="lightbox-counter-pill" aria-live="polite">
            {current + 1} / {items.length}
          </span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className={`lightbox-control-btn ${focusRing}`}
            aria-label={zoomed ? "Zoom verkleinern" : "Zoom vergrößern"}
            aria-pressed={zoomed}
          >
            {zoomed ? <ZoomOut className="h-5 w-5" /> : <ZoomIn className="h-5 w-5" />}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className={`lightbox-control-btn ${focusRing}`}
            aria-label="Bildansicht schließen"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            disabled={current === 0}
            className={`lightbox-nav-btn lightbox-nav-prev ${focusRing}`}
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
            className={`lightbox-nav-btn lightbox-nav-next ${focusRing}`}
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}

      <div
        className="lightbox-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current == null || !hasMultiple || zoomed) return;
          const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
          if (Math.abs(delta) > 48) {
            if (delta < 0) next();
            else prev();
          }
          touchStartX.current = null;
        }}
      >
        {!imageLoaded ? (
          <div className="lightbox-loader" aria-hidden>
            <Loader2 className="h-8 w-8 animate-spin text-white/80" />
          </div>
        ) : null}

        <button
          type="button"
          className={`lightbox-image-frame ${zoomed ? "is-zoomed" : ""}`}
          onClick={() => setZoomed((z) => !z)}
          aria-label={zoomed ? "Zoom verkleinern" : "Zoom vergrößern"}
          aria-pressed={zoomed}
        >
          <Image
            src={item.src}
            alt={item.alt}
            fill
            className={`lightbox-image ${imageLoaded ? "is-visible" : ""}`}
            sizes="(max-width: 768px) 100vw, 90vw"
            unoptimized={item.src.includes("supabase.co")}
            priority
            draggable={false}
            onLoad={() => setImageLoaded(true)}
          />
        </button>
      </div>

      {hasCaption ? (
        <div className="lightbox-caption" onClick={(e) => e.stopPropagation()}>
          {item.name ? (
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <p className="font-heading text-base font-bold text-white sm:text-lg">{item.name}</p>
              {typeof item.rating === "number" ? <StarRating rating={item.rating} size="sm" /> : null}
            </div>
          ) : null}
          {item.date ? <p className="mb-1 text-xs text-white/70">{item.date}</p> : null}
          {item.title ? <p className="font-medium text-white">{item.title}</p> : null}
          {item.category ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/75">{item.category}</p>
          ) : null}
          {item.description ? <p className="mt-2 text-sm leading-relaxed text-white/85">{item.description}</p> : null}
          {item.reviewText ? (
            <blockquote className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
              &ldquo;{item.reviewText}&rdquo;
            </blockquote>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
