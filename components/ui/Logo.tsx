"use client";

import { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";

interface LogoProps {
  variant?: "default" | "inverse";
  className?: string;
  showText?: boolean;
}

export function Logo({ variant = "default", className = "", showText = true }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const textColor = variant === "inverse" ? "text-text-inverse" : "text-text-primary";
  const subColor = variant === "inverse" ? "text-white/80" : "text-text-muted";

  return (
    <a
      href="#startseite"
      className={`flex items-center gap-3 ${className}`}
      aria-label="Panda-Bande Kinderevents — Startseite"
    >
      {!imgError ? (
        <div className="relative h-12 w-auto shrink-0 md:h-14">
          <Image
            src={siteConfig.assets.logo}
            alt={siteConfig.assets.logoAlt}
            width={160}
            height={56}
            className="h-12 w-auto object-contain md:h-14"
            priority
            onError={() => setImgError(true)}
          />
        </div>
      ) : showText ? (
        <div className="leading-tight">
          <span className={`block text-xs font-bold tracking-[0.15em] md:text-sm ${textColor}`}>
            PANDA-BANDE
          </span>
          <span className={`block font-heading text-[10px] tracking-widest md:text-xs ${subColor}`}>
            KINDEREVENTS
          </span>
        </div>
      ) : null}
    </a>
  );
}
