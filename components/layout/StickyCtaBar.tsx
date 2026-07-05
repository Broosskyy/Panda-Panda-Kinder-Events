"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export function StickyCtaBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky-cta-bar" role="region" aria-label="Schnellanfrage">
      <div className="sticky-cta-inner">
        <p className="sticky-cta-text hidden sm:block">Bereit für euer Event?</p>
        <Button href="#kontakt" size="lg" className="sticky-cta-button min-h-[2.75rem] flex-1 sm:flex-none">
          Jetzt unverbindlich anfragen
        </Button>
      </div>
    </div>
  );
}
