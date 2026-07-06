"use client";

import Image from "next/image";
import { LOGO_ASPECT_RATIO, LOGO_SIZE_PX, type LogoContext } from "@/lib/brand";
import { resolveBrandAlt, resolveBrandLogo } from "@/lib/brand/resolve";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteBrandingSettings } from "@/lib/cms/types";

type LogoSize = LogoContext;

interface LogoProps {
  context?: LogoSize;
  className?: string;
  branding?: SiteBrandingSettings;
  linked?: boolean;
  priority?: boolean;
}

function heightForContext(context: LogoSize): number {
  switch (context) {
    case "header":
      return LOGO_SIZE_PX.headerMobile;
    case "footer":
      return LOGO_SIZE_PX.footer;
    case "splash":
      return LOGO_SIZE_PX.splash;
    case "admin":
      return LOGO_SIZE_PX.adminSidebar;
    case "login":
      return LOGO_SIZE_PX.login;
    case "decorative":
      return LOGO_SIZE_PX.decorative;
    case "email":
      return LOGO_SIZE_PX.email;
    case "pdf":
      return Math.round(LOGO_SIZE_PX.pdfWidth / LOGO_ASPECT_RATIO);
    default:
      return LOGO_SIZE_PX.headerMobile;
  }
}

function heightClassForContext(context: LogoSize): string {
  switch (context) {
    case "header":
      return "h-[46px] sm:h-[48px] md:h-[60px]";
    case "footer":
      return "h-12";
    case "splash":
      return "h-[120px] sm:h-[140px] md:h-[160px]";
    case "admin":
      return "h-[38px]";
    case "login":
      return "h-[90px]";
    case "decorative":
      return "h-20";
    default:
      return "h-12";
  }
}

export function Logo({
  context = "header",
  className = "",
  branding = DEFAULT_SITE_SETTINGS.branding,
  linked = true,
  priority,
}: LogoProps) {
  const logoSrc = resolveBrandLogo(branding, context);
  const logoAlt = resolveBrandAlt(branding);
  const heightPx = heightForContext(context);
  const widthPx = Math.round(heightPx * LOGO_ASPECT_RATIO);
  const heightClass = heightClassForContext(context);
  const shouldPreload = priority ?? (context === "header" || context === "splash");

  const inner = (
    <span
      className={`relative inline-flex shrink-0 items-center ${heightClass} ${className}`}
      style={{ aspectRatio: LOGO_ASPECT_RATIO }}
    >
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={widthPx}
        height={heightPx}
        className={`${heightClass} w-auto max-w-none object-contain object-left`}
        priority={shouldPreload}
      />
    </span>
  );

  const focusClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  if (!linked) {
    return inner;
  }

  return (
    <a
      href="#startseite"
      className={`inline-flex shrink-0 items-center overflow-visible ${focusClass}`}
      aria-label={`${branding.logoTextPrimary} — Startseite`}
    >
      {inner}
    </a>
  );
}

/** Dekoratives Logo (Formulare, leere Zustände) — ersetzt PandaMascot */
export function BrandMark({
  className = "",
  branding = DEFAULT_SITE_SETTINGS.branding,
  size = "decorative" as LogoContext,
}: {
  className?: string;
  branding?: SiteBrandingSettings;
  size?: LogoContext;
}) {
  return <Logo context={size} branding={branding} linked={false} className={className} />;
}
