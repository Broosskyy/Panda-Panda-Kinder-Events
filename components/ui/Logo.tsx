"use client";

import { useState } from "react";
import Image from "next/image";
import { BRAND, LOGO_ASPECT_RATIO, LOGO_HEIGHT } from "@/lib/brand";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteBrandingSettings } from "@/lib/cms/types";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  variant?: "default" | "inverse";
  className?: string;
  size?: LogoSize;
  branding?: SiteBrandingSettings;
  /** Link zur Startseite (false für dekoratives Logo) */
  linked?: boolean;
}

const SIZE_HEIGHT: Record<LogoSize, string> = {
  sm: "h-8 max-h-8",
  md: LOGO_HEIGHT.header,
  lg: `${LOGO_HEIGHT.header} ${LOGO_HEIGHT.headerDesktop}`,
  xl: LOGO_HEIGHT.splash,
};

function resolveLogoSrc(branding: SiteBrandingSettings, variant: "default" | "inverse"): string {
  const custom = branding.logoUrl?.trim();
  if (custom && custom !== "/assets/logo.png" && !custom.endsWith("/assets/logo.png")) {
    return custom;
  }
  return variant === "inverse" ? BRAND.logo.svgInverse : BRAND.logo.svg;
}

export function Logo({
  variant = "default",
  className = "",
  size = "md",
  branding = DEFAULT_SITE_SETTINGS.branding,
  linked = true,
}: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const textColor = variant === "inverse" ? "text-text-inverse" : "text-text-primary";
  const subColor = variant === "inverse" ? "text-white/85" : "text-text-muted";
  const heightClass = SIZE_HEIGHT[size];
  const logoSrc = resolveLogoSrc(branding, variant);
  const logoAlt = branding.logoAlt?.trim() || BRAND.logo.alt;

  const inner = !imgError ? (
    <span
      className={`relative inline-flex shrink-0 items-center ${heightClass}`}
      style={{ aspectRatio: LOGO_ASPECT_RATIO }}
    >
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={BRAND.logo.width}
        height={BRAND.logo.height}
        className={`${heightClass} w-auto max-w-none object-contain object-left`}
        priority={size === "lg" || size === "xl"}
        onError={() => setImgError(true)}
      />
    </span>
  ) : (
    <span className="inline-block py-0.5 leading-tight">
      <span className={`block text-sm font-bold tracking-[0.15em] ${textColor}`}>
        {branding.logoTextPrimary}
      </span>
      <span className={`block font-heading text-xs tracking-widest ${subColor}`}>
        {branding.logoTextSecondary}
      </span>
    </span>
  );

  const focusClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  if (!linked) {
    return <span className={`inline-flex shrink-0 items-center ${className}`}>{inner}</span>;
  }

  return (
    <a
      href="#startseite"
      className={`inline-flex shrink-0 items-center overflow-visible ${focusClass} ${className}`}
      aria-label={`${branding.logoTextPrimary} — Startseite`}
    >
      {inner}
    </a>
  );
}
