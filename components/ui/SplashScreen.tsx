"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { BRAND, LOGO_ASPECT_RATIO, LOGO_SIZE_PX } from "@/lib/brand";
import { resolveBrandAlt } from "@/lib/brand/resolve";

const SPLASH_DURATION_MS = 1200;
const FADE_DURATION_MS = 450;
const STORAGE_KEY = "pb-splash-seen";

interface SplashScreenProps {
  tagline?: string;
}

function shouldSkipSplash(): boolean {
  if (typeof window === "undefined") return true;

  try {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return true;
  } catch {
    /* private browsing */
  }

  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav && (nav.type === "back_forward" || nav.type === "reload")) return true;

  return false;
}

export function SplashScreen({ tagline = BRAND.splashTagline }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const heightPx = LOGO_SIZE_PX.splash;
  const widthPx = Math.round(heightPx * LOGO_ASPECT_RATIO);

  useEffect(() => {
    if (shouldSkipSplash()) return;

    setVisible(true);
    document.body.classList.add("splash-active");

    const fadeTimer = window.setTimeout(() => setFadeOut(true), SPLASH_DURATION_MS);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      document.body.classList.remove("splash-active");
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, SPLASH_DURATION_MS + FADE_DURATION_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
      document.body.classList.remove("splash-active");
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`splash-screen ${fadeOut ? "splash-screen-fade-out" : ""}`}
      role="presentation"
      aria-hidden={fadeOut}
    >
      <div className="splash-screen-content">
        <div className="splash-logo-wrap">
          <Image
            src={BRAND.master}
            alt={resolveBrandAlt()}
            width={widthPx}
            height={heightPx}
            className="splash-logo"
            priority
          />
        </div>
        <p className="splash-tagline">{tagline}</p>
      </div>
    </div>
  );
}
