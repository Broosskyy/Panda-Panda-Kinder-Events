"use client";

import { useState } from "react";
import Image from "next/image";
import { siteConfig } from "@/config/site";

interface LogoProps {
  variant?: "default" | "inverse";
  className?: string;
  size?: "default" | "large" | "xl";
}

export function Logo({ variant = "default", className = "", size = "default" }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const textColor = variant === "inverse" ? "text-text-inverse" : "text-text-primary";
  const subColor = variant === "inverse" ? "text-white/85" : "text-text-muted";
  const heightClass =
    size === "xl"
      ? "h-11 sm:h-14 md:h-[5.5rem]"
      : size === "large"
        ? "h-10 sm:h-[3.75rem] md:h-[5rem]"
        : "h-10 sm:h-12 md:h-14";

  return (
    <a
      href="#startseite"
      className={`flex items-center ${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
      aria-label="Panda-Bande Kinderevents — Startseite"
    >
      {!imgError ? (
        <div className={`relative w-auto shrink-0 ${heightClass}`}>
          <Image
            src={siteConfig.assets.logo}
            alt=""
            width={200}
            height={72}
            className={`${heightClass} w-auto object-contain`}
            priority
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="leading-tight">
          <span className={`block text-sm font-bold tracking-[0.15em] ${textColor}`}>
            PANDA-BANDE
          </span>
          <span className={`block font-heading text-xs tracking-widest ${subColor}`}>
            KINDEREVENTS
          </span>
        </div>
      )}
    </a>
  );
}
