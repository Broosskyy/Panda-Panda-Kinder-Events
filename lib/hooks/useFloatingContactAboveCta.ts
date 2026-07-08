"use client";

import { useEffect, useState } from "react";

/** Lift WhatsApp FAB above the sticky CTA bar when it is mounted on mobile. */
export function useFloatingContactAboveCta(): boolean {
  const [aboveCta, setAboveCta] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const sync = () => {
      if (!mq.matches) {
        setAboveCta(false);
        return;
      }
      setAboveCta(Boolean(document.querySelector(".sticky-cta-bar")));
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    mq.addEventListener("change", sync);

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("scroll", sync);
      mq.removeEventListener("change", sync);
      observer.disconnect();
    };
  }, []);

  return aboveCta;
}
