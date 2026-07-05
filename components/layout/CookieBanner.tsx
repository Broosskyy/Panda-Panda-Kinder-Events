"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "panda-bande-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie-Hinweis">
      <div className="cookie-banner-inner">
        <p className="cookie-banner-text">
          Wir verwenden nur technisch notwendige Speicherung für die Website-Funktion. Details in der{" "}
          <Link href="/datenschutz" className="underline hover:no-underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <button type="button" className="cookie-banner-btn" onClick={accept}>
          Verstanden
        </button>
      </div>
    </div>
  );
}
