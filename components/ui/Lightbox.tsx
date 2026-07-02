"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { focusRing } from "@/lib/a11y";

interface LightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-text-primary/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <p id={titleId} className="sr-only">
        Bildansicht: {alt}
      </p>
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        className={`absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25 ${focusRing}`}
        aria-label="Bildansicht schließen"
      >
        <X className="h-6 w-6" aria-hidden />
      </button>
      <div className="relative max-h-[85vh] w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={900}
          className="max-h-[85vh] w-full rounded-2xl object-contain"
        />
      </div>
    </div>
  );
}
