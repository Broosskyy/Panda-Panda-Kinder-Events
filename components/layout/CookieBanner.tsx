"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "panda-bande-cookie-consent";

interface CookieBannerProps {
  noticeText?: string;
}

export function CookieBanner({ noticeText }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem(CONSENT_KEY);
      setVisible(!stored);
    };
    sync();
    window.addEventListener("panda-cookie-consent-reset", sync);
    return () => window.removeEventListener("panda-cookie-consent-reset", sync);
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
          {noticeText || (
            <>
              Wir verwenden nur technisch notwendige Speicherung für die Website-Funktion. Details in der{" "}
              <Link href="/datenschutz" className="underline hover:no-underline">
                Datenschutzerklärung
              </Link>
              .
            </>
          )}
        </p>
        <button type="button" className="cookie-banner-btn" onClick={accept}>
          Verstanden
        </button>
      </div>
    </div>
  );
}
