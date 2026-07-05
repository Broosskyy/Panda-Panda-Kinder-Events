import { fetchSiteSettings } from "@/lib/cms/data";
import type { SiteEmailSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";

export const RESEND_TEST_FROM = "onboarding@resend.dev";

export type EmailDomainStatus = "test" | "verified" | "pending" | "failed" | "not_configured";

export interface EmailDomainCheck {
  status: EmailDomainStatus;
  domain: string | null;
  message: string;
}

export interface ResolvedEmailSender {
  from: string;
  replyTo: string;
  usesTestDomain: boolean;
  domainStatus: EmailDomainStatus;
  displayFrom: string;
}

function extractDomain(email: string): string | null {
  const match = email.trim().match(/@([^@\s]+)$/);
  return match?.[1]?.toLowerCase() ?? null;
}

function isResendTestDomain(email: string): boolean {
  return email.toLowerCase().endsWith("@resend.dev");
}

function mergeEmailSettings(raw: SiteEmailSettings, contactEmail: string): SiteEmailSettings {
  const defaults = DEFAULT_SITE_SETTINGS.email;
  const customAddresses = {
    ...defaults.customAddresses,
    ...(raw.customAddresses ?? {}),
  };

  const inquiryRecipient =
    raw.inquiryRecipient ||
    raw.notificationEmail ||
    process.env.INQUIRY_NOTIFICATION_EMAIL ||
    raw.copyToEmail ||
    raw.replyTo ||
    contactEmail;

  return {
    companyName: raw.companyName || defaults.companyName,
    senderName: raw.senderName || defaults.senderName,
    senderEmail: raw.senderEmail || defaults.senderEmail,
    replyTo: raw.replyTo || raw.senderEmail || contactEmail,
    copyToEmail: raw.copyToEmail || inquiryRecipient,
    quoteCopyTo: raw.quoteCopyTo || raw.copyToEmail || inquiryRecipient,
    invoiceCopyTo: raw.invoiceCopyTo || raw.copyToEmail || inquiryRecipient,
    inquiryRecipient,
    customAddresses,
    notificationEmail: raw.notificationEmail,
  };
}

export async function getEmailSettings(): Promise<SiteEmailSettings> {
  const settings = await fetchSiteSettings();
  return mergeEmailSettings(settings.email, settings.contact.email);
}

export async function checkResendDomainStatus(senderEmail: string): Promise<EmailDomainCheck> {
  const domain = extractDomain(senderEmail);

  if (!senderEmail.trim()) {
    return {
      status: "not_configured",
      domain: null,
      message: "Keine Absender-E-Mail konfiguriert.",
    };
  }

  if (isResendTestDomain(senderEmail)) {
    return {
      status: "test",
      domain: "resend.dev",
      message: "Resend-Testdomain wird verwendet.",
    };
  }

  if (!domain) {
    return {
      status: "not_configured",
      domain: null,
      message: "Ungültige Absender-E-Mail.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      status: "not_configured",
      domain,
      message: "RESEND_API_KEY ist nicht gesetzt — Testdomain wird verwendet.",
    };
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { data, error } = await resend.domains.list();

    if (error) {
      return {
        status: "test",
        domain,
        message: `Domain-Prüfung fehlgeschlagen: ${error.message}. Testdomain wird verwendet.`,
      };
    }

    const domains = data?.data ?? [];
    const match = domains.find((d) => d.name === domain || domain.endsWith(`.${d.name}`));

    if (!match) {
      return {
        status: "test",
        domain,
        message: `Domain „${domain}" ist in Resend nicht hinterlegt. Testdomain wird verwendet.`,
      };
    }

    if (match.status === "verified") {
      return {
        status: "verified",
        domain: match.name,
        message: `Domain „${match.name}" ist verifiziert.`,
      };
    }

    if (match.status === "failed" || match.status === "partially_failed") {
      return {
        status: "failed",
        domain: match.name,
        message: `Domain „${match.name}" — Verifizierung fehlgeschlagen (${match.status}).`,
      };
    }

    return {
      status: "pending",
      domain: match.name,
      message: `Domain „${match.name}" — Verifizierung ausstehend (${match.status}).`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return {
      status: "test",
      domain,
      message: `Domain-Prüfung nicht möglich: ${message}. Testdomain wird verwendet.`,
    };
  }
}

export async function resolveEmailSender(settings?: SiteEmailSettings): Promise<ResolvedEmailSender> {
  const email = settings ?? (await getEmailSettings());
  const senderName = email.senderName || email.companyName;
  const domainCheck = await checkResendDomainStatus(email.senderEmail);
  const replyTo = email.replyTo || email.senderEmail;

  if (domainCheck.status === "verified" && !isResendTestDomain(email.senderEmail)) {
    const fromEmail = email.senderEmail.trim();
    return {
      from: `${senderName} <${fromEmail}>`,
      replyTo,
      usesTestDomain: false,
      domainStatus: "verified",
      displayFrom: `${senderName} <${fromEmail}>`,
    };
  }

  const from = senderName ? `${senderName} <${RESEND_TEST_FROM}>` : RESEND_TEST_FROM;

  return {
    from,
    replyTo,
    usesTestDomain: true,
    domainStatus: domainCheck.status === "verified" ? "test" : domainCheck.status,
    displayFrom: from,
  };
}

export function getInquiryRecipient(settings: SiteEmailSettings): string {
  return (
    settings.inquiryRecipient ||
    settings.notificationEmail ||
    process.env.INQUIRY_NOTIFICATION_EMAIL ||
    settings.copyToEmail ||
    settings.replyTo
  );
}

export function getCopyEmailForDocument(settings: SiteEmailSettings, type: "quote" | "invoice"): string {
  if (type === "quote" && settings.quoteCopyTo?.trim()) return settings.quoteCopyTo.trim();
  if (type === "invoice" && settings.invoiceCopyTo?.trim()) return settings.invoiceCopyTo.trim();
  return settings.copyToEmail?.trim() || getInquiryRecipient(settings);
}

/** @deprecated use getInquiryRecipient or getCopyEmailForDocument */
export function getNotificationEmailFromSettings(settings: SiteEmailSettings): string {
  return getInquiryRecipient(settings);
}
