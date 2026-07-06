"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

interface StickyCtaBarProps {
  label?: string;
  sublabel?: string;
}

export function StickyCtaBar({
  label = "Jetzt unverbindlich anfragen",
  sublabel = "Bereit für euer Event?",
}: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false);
  const [hideForForm, setHideForForm] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const kontakt = document.getElementById("kontakt");
    const bewertungForm = document.getElementById("bewertung-form");
    const targets = [kontakt, bewertungForm].filter(Boolean) as HTMLElement[];

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const overlaps = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.15);
        setHideForForm(overlaps);
      },
      { threshold: [0, 0.15, 0.35] },
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!visible || hideForForm) return null;

  return (
    <div className="sticky-cta-bar" role="region" aria-label="Schnellanfrage">
      <div className="sticky-cta-inner">
        <p className="sticky-cta-text hidden sm:block">{sublabel}</p>
        <Button href="#kontakt" size="lg" className="sticky-cta-button min-h-[2.75rem] flex-1 sm:flex-none">
          {label}
        </Button>
      </div>
    </div>
  );
}
