"use client";

import { useEffect, useState } from "react";

function stickyCtaIsVisible(): boolean {
  const bar = document.querySelector<HTMLElement>(".sticky-cta-bar");
  if (!bar) return false;
  if (bar.classList.contains("sticky-cta-bar--scroll-hidden")) return false;
  return bar.getAttribute("data-sticky-cta-visible") !== "hidden";
}

/** Lift WhatsApp FAB above the sticky CTA bar when it is visible on mobile. */
export function useFloatingContactAboveCta(): boolean {
  const [aboveCta, setAboveCta] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const sync = () => {
      if (!mq.matches) {
        setAboveCta(false);
        return;
      }
      setAboveCta(stickyCtaIsVisible());
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    mq.addEventListener("change", sync);

    const observer = new MutationObserver(sync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "data-sticky-cta-visible"],
    });

    return () => {
      window.removeEventListener("scroll", sync);
      mq.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  return aboveCta;
}
