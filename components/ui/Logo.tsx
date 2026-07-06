"use client";

import Image from "next/image";
import { LOGO_MARK_ASPECT, LOGO_SIZE_PX, type LogoContext } from "@/lib/brand";
import { resolveBrandAlt, resolveBrandLogo } from "@/lib/brand/resolve";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteBrandingSettings } from "@/lib/cms/types";

interface LogoProps {
  context?: LogoContext;
  variant?: "default" | "inverse";
  className?: string;
  branding?: SiteBrandingSettings;
  linked?: boolean;
  priority?: boolean;
  showText?: boolean;
}

function markHeightForContext(context: LogoContext): number {
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
      return Math.round(LOGO_SIZE_PX.pdfWidth / LOGO_MARK_ASPECT);
    default:
      return LOGO_SIZE_PX.headerMobile;
  }
}

function markHeightClass(context: LogoContext): string {
  switch (context) {
    case "header":
      return "h-10 sm:h-11 md:h-12";
    case "footer":
      return "h-11";
    case "splash":
      return "h-24 sm:h-28 md:h-32";
    case "admin":
      return "h-9";
    case "login":
      return "h-[72px]";
    case "decorative":
      return "h-16";
    default:
      return "h-10";
  }
}

function textSizeClass(context: LogoContext): string {
  switch (context) {
    case "splash":
    case "login":
      return "text-base sm:text-lg";
    case "footer":
      return "text-sm sm:text-base";
    default:
      return "text-xs sm:text-sm";
  }
}

export function Logo({
  context = "header",
  variant = "default",
  className = "",
  branding = DEFAULT_SITE_SETTINGS.branding,
  linked = true,
  priority,
  showText,
}: LogoProps) {
  const logoSrc = resolveBrandLogo(branding, context);
  const logoAlt = resolveBrandAlt(branding);
  const markH = markHeightForContext(context);
  const markW = Math.round(markH * LOGO_MARK_ASPECT);
  const markClass = markHeightClass(context);
  const shouldPreload = priority ?? (context === "header" || context === "splash");
  const displayText = showText ?? branding.showTextMark !== false;
  const isInverse = variant === "inverse";
  const primary = branding.logoTextPrimary || "PANDA-BANDE";
  const secondary = branding.logoTextSecondary || "KINDEREVENTS";
  const textPrimaryClass = isInverse ? "text-white" : "text-text-primary";
  const textSecondaryClass = isInverse ? "text-white/85" : "text-text-muted";

  const inner = (
    <span className={`inline-flex max-w-full items-center gap-2 sm:gap-2.5 ${className}`}>
      <span className={`relative inline-flex shrink-0 items-center ${markClass}`} style={{ aspectRatio: LOGO_MARK_ASPECT }}>
        <Image
          src={logoSrc}
          alt={logoAlt}
          width={markW}
          height={markH}
          className={`${markClass} w-auto max-w-none object-contain object-left`}
          priority={shouldPreload}
        />
      </span>
      {displayText ? (
        <span className={`min-w-0 leading-tight ${textSizeClass(context)}`}>
          <span className={`block font-bold tracking-[0.14em] ${textPrimaryClass}`}>{primary}</span>
          <span className={`mt-0.5 block font-heading text-[0.65em] tracking-[0.28em] sm:text-[0.7em] ${textSecondaryClass}`}>
            {secondary}
          </span>
        </span>
      ) : null}
    </span>
  );

  const focusClass =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

  if (!linked) return inner;

  return (
    <a
      href="#startseite"
      className={`inline-flex shrink-0 items-center overflow-visible ${focusClass}`}
      aria-label={`${primary} ${secondary} — Startseite`}
    >
      {inner}
    </a>
  );
}

export function BrandMark({
  className = "",
  branding = DEFAULT_SITE_SETTINGS.branding,
  size = "decorative" as LogoContext,
}: {
  className?: string;
  branding?: SiteBrandingSettings;
  size?: LogoContext;
}) {
  return <Logo context={size} branding={branding} linked={false} showText={false} className={className} />;
}
