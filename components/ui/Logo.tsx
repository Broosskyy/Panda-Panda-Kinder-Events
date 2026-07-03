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
      ? "max-h-9 sm:max-h-11 md:max-h-14"
      : size === "large"
        ? "max-h-9 sm:max-h-10 md:max-h-12"
        : "max-h-9 sm:max-h-10 md:max-h-12";

  return (
    <a
      href="#startseite"
      className={`flex shrink-0 items-center overflow-visible ${className} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
      aria-label="Panda-Bande Kinderevents — Startseite"
    >
      {!imgError ? (
        <div className={`relative w-auto ${heightClass}`}>
          <Image
            src={siteConfig.assets.logo}
            alt=""
            width={200}
            height={72}
            className={`${heightClass} w-auto object-contain object-left`}
            priority
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="py-0.5 leading-tight">
          <span className={`block text-sm font-bold tracking-[0.15em] ${textColor}`}>PANDA-BANDE</span>
          <span className={`block font-heading text-xs tracking-widest ${subColor}`}>KINDEREVENTS</span>
        </div>
      )}
    </a>
  );
}
