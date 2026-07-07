"use client";

import type { DomainVerificationDisplay } from "@/lib/email/resend-domain-check";
import {
  API_CHECK_UNAVAILABLE_MESSAGE,
  DOMAIN_MANUAL_CONFIRM_MESSAGE,
  domainStatusUserMessage,
} from "@/lib/email/domain-status-copy";

interface DomainVerificationBannerProps {
  state: DomainVerificationDisplay;
  message?: string;
  hasSuccessfulTest?: boolean;
  className?: string;
}

export function DomainVerificationBanner({
  state,
  message,
  hasSuccessfulTest = false,
  className = "",
}: DomainVerificationBannerProps) {
  const manualOk = state === "unknown" && hasSuccessfulTest;

  const style = manualOk || state === "verified"
    ? "border-green-300/60 bg-green-50 text-green-950"
    : state === "not_verified"
      ? "border-red-300/60 bg-red-50 text-red-950"
      : "border-amber-300/60 bg-amber-50 text-amber-950";

  const label = manualOk
    ? "🟢 Versand funktioniert"
    : state === "verified"
      ? "🟢 Domain verifiziert"
      : state === "not_verified"
        ? "🔴 Domain nicht verifiziert"
        : "🟡 Automatische Prüfung nicht möglich";

  const detail =
    message ||
    (manualOk
      ? DOMAIN_MANUAL_CONFIRM_MESSAGE
      : state === "unknown"
        ? `${API_CHECK_UNAVAILABLE_MESSAGE} Wenn Test-E-Mails ankommen, ist der Versand in Ordnung.`
        : domainStatusUserMessage(state, hasSuccessfulTest));

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${style} ${className}`}>
      <strong>{label}</strong>
      {detail ? <p className="mt-1">{detail}</p> : null}
    </div>
  );
}
