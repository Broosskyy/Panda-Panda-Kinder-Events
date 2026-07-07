import type { DomainVerificationDisplay } from "@/lib/email/resend-domain-check";

/** Wenn die Resend-API den Domainstatus nicht lesen kann (z. B. eingeschränkter API-Key). */
export const API_CHECK_UNAVAILABLE_MESSAGE = "Status konnte nicht automatisch geprüft werden.";

/** Wenn Testmails ankommen, aber die Domain nicht automatisch geprüft werden kann. */
export const DOMAIN_MANUAL_CONFIRM_MESSAGE =
  "Versand funktioniert – Domainprüfung manuell in Resend bestätigt.";

export function isTestEmailLog(log: {
  template_slug: string | null;
  subject: string;
  status: string;
}): boolean {
  return log.status === "sent" && (log.template_slug === "test" || log.subject.includes("Test-E-Mail"));
}

export function domainStatusLabel(
  state: DomainVerificationDisplay,
  hasSuccessfulTest: boolean,
): string {
  if (state === "verified") return "Domain verifiziert";
  if (state === "unknown" && hasSuccessfulTest) return DOMAIN_MANUAL_CONFIRM_MESSAGE;
  if (state === "unknown") return API_CHECK_UNAVAILABLE_MESSAGE;
  return "Domain nicht verifiziert";
}

export function domainStatusUserMessage(
  state: DomainVerificationDisplay,
  hasSuccessfulTest: boolean,
): string {
  if (state === "verified") {
    return "Die Versand-Domain ist in Resend verifiziert.";
  }
  if (state === "unknown" && hasSuccessfulTest) {
    return DOMAIN_MANUAL_CONFIRM_MESSAGE;
  }
  if (state === "unknown") {
    return `${API_CHECK_UNAVAILABLE_MESSAGE} Wenn Test-E-Mails ankommen, ist der Versand in Ordnung.`;
  }
  return "Die Domain ist in Resend noch nicht verifiziert.";
}
