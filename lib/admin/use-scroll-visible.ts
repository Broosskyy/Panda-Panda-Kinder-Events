"use client";

import { useEffect, useRef, useState } from "react";

/** Hide chrome on scroll down, show on scroll up (window or scrollable main). */
export function useScrollVisible(enabled = true, threshold = 48): boolean {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }

    const getScrollTop = () => {
      const main = document.querySelector<HTMLElement>(".admin-main");
      if (main && main.scrollHeight > main.clientHeight + 1) return main.scrollTop;
      return window.scrollY;
    };

    const onScroll = () => {
      const y = getScrollTop();
      if (y <= threshold) {
        setVisible(true);
        lastY.current = y;
        return;
      }
      setVisible(y < lastY.current);
      lastY.current = y;
    };

    const main = document.querySelector<HTMLElement>(".admin-main");
    window.addEventListener("scroll", onScroll, { passive: true });
    main?.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      main?.removeEventListener("scroll", onScroll);
    };
  }, [enabled, threshold]);

  return visible;
}
