"use client";

import { useEffect, useState } from "react";

/** Hide floating chrome when contact or review forms are in view (avoids covering inputs/stars). */
export function useHideNearFormSections(): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = ["kontakt", "bewertung-form"]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const overlaps = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.12);
        setHidden(overlaps);
      },
      { threshold: [0, 0.12, 0.3] },
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return hidden;
}
