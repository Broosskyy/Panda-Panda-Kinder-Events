"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { resolvePublicHref } from "@/lib/public-href";

interface StickyCtaBarProps {
  label?: string;
  sublabel?: string;
}

export function StickyCtaBar({
  label = "Unverbindlich anfragen",
  sublabel = "Bereit für euer Event?",
}: StickyCtaBarProps) {
  const [visible, setVisible] = useState(false);
  const [scrollHidden, setScrollHidden] = useState(false);
  const [hideForForm, setHideForForm] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y > 360);

      if (y > 480) {
        const delta = y - lastScrollY.current;
        if (Math.abs(delta) > 6) {
          setScrollHidden(delta > 0);
        }
      } else {
        setScrollHidden(false);
      }

      lastScrollY.current = y;
    };

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
        const overlaps = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.12);
        setHideForForm(overlaps);
      },
      { threshold: [0, 0.12, 0.3] },
    );

    for (const el of targets) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const showChrome = visible && !hideForForm && !scrollHidden;
    if (showChrome) {
      root.setAttribute("data-sticky-cta", "visible");
    } else {
      root.removeAttribute("data-sticky-cta");
    }
    return () => root.removeAttribute("data-sticky-cta");
  }, [visible, hideForForm, scrollHidden]);

  if (!visible || hideForForm) return null;

  return (
    <div
      className={`sticky-cta-bar${scrollHidden ? " sticky-cta-bar--scroll-hidden" : ""}`}
      role="region"
      aria-label="Schnellanfrage"
      data-sticky-cta-visible={scrollHidden ? "hidden" : "shown"}
    >
      <div className="sticky-cta-inner">
        <p className="sticky-cta-text hidden sm:block">{sublabel}</p>
        <Button href={resolvePublicHref("#kontakt")} size="lg" className="sticky-cta-button min-h-12 flex-1 sm:flex-none">
          {label}
        </Button>
      </div>
    </div>
  );
}
