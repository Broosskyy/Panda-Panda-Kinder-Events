"use client";

import type { DomainVerificationDisplay } from "@/lib/email/resend-domain-check";

interface DomainVerificationBannerProps {
  state: DomainVerificationDisplay;
  message?: string;
  className?: string;
}

const STYLES: Record<DomainVerificationDisplay, string> = {
  verified: "border-green-300/60 bg-green-50 text-green-950",
  not_verified: "border-red-300/60 bg-red-50 text-red-950",
  unknown: "border-amber-300/60 bg-amber-50 text-amber-950",
};

const LABELS: Record<DomainVerificationDisplay, string> = {
  verified: "🟢 Domain verifiziert",
  not_verified: "🔴 Domain nicht verifiziert",
  unknown: "🟡 Status unbekannt",
};

export function DomainVerificationBanner({ state, message, className = "" }: DomainVerificationBannerProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${STYLES[state]} ${className}`}>
      <strong>{LABELS[state]}</strong>
      {message ? <p className="mt-1">{message}</p> : null}
    </div>
  );
}
