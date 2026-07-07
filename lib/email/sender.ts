import { fetchSiteSettings } from "@/lib/cms/data";
import type { SiteEmailSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import {
  DEFAULT_COMPANY_EMAIL,
  DEFAULT_SENDER_NAME,
} from "@/lib/email/constants";
import { checkResendDomainLive, type DomainVerificationDisplay } from "@/lib/email/resend-domain-check";

export type EmailDomainStatus = "verified" | "not_verified" | "unknown" | "pending" | "failed" | "not_configured" | "test";

export interface EmailDomainCheck {
  status: EmailDomainStatus;
  domain: string | null;
  message: string;
}

export interface ResolvedEmailSender {
  from: string;
  replyTo: string;
  /** @deprecated use domainVerification */
  usesTestDomain: boolean;
  domainStatus: EmailDomainStatus;
  domainVerification: DomainVerificationDisplay;
  displayFrom: string;
}

function isResendTestDomain(email: string): boolean {
  return email.toLowerCase().endsWith("@resend.dev");
}

function isDeprecatedSenderEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return true;
  if (isResendTestDomain(normalized)) return true;
  if (normalized.endsWith("@panda-bande-events.de")) return true;
  if (normalized.startsWith("noreply@")) return true;
  if (normalized === "kontakt@" || normalized === "kontakt") return true;
  return false;
}

export function normalizeProductionEmail(email: string | undefined | null): string {
  const trimmed = email?.trim() ?? "";
  if (!trimmed || isDeprecatedSenderEmail(trimmed)) {
    return DEFAULT_COMPANY_EMAIL;
  }
  return trimmed;
}

export function normalizeSenderName(name: string | undefined | null): string {
  const trimmed = name?.trim() ?? "";
  return trimmed || DEFAULT_SENDER_NAME;
}

function mergeEmailSettings(raw: SiteEmailSettings, contactEmail: string): SiteEmailSettings {
  const defaults = DEFAULT_SITE_SETTINGS.email;
  const merged = { ...defaults, ...raw, customAddresses: { ...defaults.customAddresses, ...(raw.customAddresses ?? {}) } };

  const inquiryRecipient = normalizeProductionEmail(
    merged.inquiryRecipient ||
      merged.notificationEmail ||
      process.env.INQUIRY_NOTIFICATION_EMAIL ||
      merged.companyEmail ||
      merged.copyToEmail ||
      merged.replyTo ||
      contactEmail,
  );

  const companyEmail = normalizeProductionEmail(
    merged.companyEmail || merged.copyToEmail || merged.replyTo || inquiryRecipient,
  );

  const senderEmail = normalizeProductionEmail(merged.senderEmail);
  const replyTo = normalizeProductionEmail(merged.branding?.replyTo || merged.replyTo || senderEmail);
  const senderName = normalizeSenderName(merged.branding?.senderName || merged.senderName);

  return {
    ...merged,
    senderName,
    senderEmail,
    companyEmail,
    replyTo,
    copyToEmail: normalizeProductionEmail(merged.copyToEmail || companyEmail),
    quoteCopyTo: normalizeProductionEmail(merged.quoteCopyTo || merged.copyToEmail || companyEmail),
    invoiceCopyTo: normalizeProductionEmail(merged.invoiceCopyTo || merged.copyToEmail || companyEmail),
    inquiryRecipient,
    adminNotificationEmail: normalizeProductionEmail(merged.adminNotificationEmail || companyEmail),
    reviewRecipient: normalizeProductionEmail(
      merged.reviewRecipient || merged.adminNotificationEmail || companyEmail,
    ),
    branding: {
      ...defaults.branding,
      ...(merged.branding ?? {}),
      senderName,
      replyTo,
    },
    signature: { ...defaults.signature, ...(merged.signature ?? {}) },
    testMode: { ...defaults.testMode, ...(merged.testMode ?? {}) },
  };
}

export async function getEmailSettings(): Promise<SiteEmailSettings> {
  const settings = await fetchSiteSettings();
  return mergeEmailSettings(settings.email, settings.contact.email);
}

export async function checkResendDomainStatus(senderEmail: string): Promise<EmailDomainCheck> {
  const live = await checkResendDomainLive(senderEmail);

  if (live.state === "verified") {
    return {
      status: "verified",
      domain: live.domain,
      message: live.message,
    };
  }

  if (live.state === "not_verified") {
    return {
      status: "not_verified",
      domain: live.domain,
      message: live.message,
    };
  }

  return {
    status: "unknown",
    domain: live.domain,
    message: live.message,
  };
}

export async function resolveEmailSender(settings?: SiteEmailSettings): Promise<ResolvedEmailSender> {
  const email = settings ?? (await getEmailSettings());
  const senderName = normalizeSenderName(email.branding?.senderName || email.senderName);
  const fromEmail = normalizeProductionEmail(email.senderEmail);
  const replyTo = normalizeProductionEmail(email.branding?.replyTo || email.replyTo || fromEmail);
  const liveCheck = await checkResendDomainLive(fromEmail);
  const displayFrom = `${senderName} <${fromEmail}>`;

  const domainStatus: EmailDomainStatus =
    liveCheck.state === "verified"
      ? "verified"
      : liveCheck.state === "not_verified"
        ? "not_verified"
        : "unknown";

  return {
    from: displayFrom,
    replyTo,
    usesTestDomain: liveCheck.state !== "verified",
    domainStatus,
    domainVerification: liveCheck.state,
    displayFrom,
  };
}

export function getInquiryRecipient(settings: SiteEmailSettings): string {
  return normalizeProductionEmail(
    settings.inquiryRecipient ||
      settings.notificationEmail ||
      process.env.INQUIRY_NOTIFICATION_EMAIL ||
      settings.copyToEmail ||
      settings.replyTo,
  );
}

export function getAdminNotificationRecipient(settings: SiteEmailSettings): string {
  return normalizeProductionEmail(settings.adminNotificationEmail || getInquiryRecipient(settings));
}

export function getReviewRecipient(settings: SiteEmailSettings): string {
  return normalizeProductionEmail(settings.reviewRecipient || getAdminNotificationRecipient(settings));
}

export function getCopyEmailForDocument(settings: SiteEmailSettings, type: "quote" | "invoice"): string {
  if (type === "quote" && settings.quoteCopyTo?.trim()) {
    return normalizeProductionEmail(settings.quoteCopyTo);
  }
  if (type === "invoice" && settings.invoiceCopyTo?.trim()) {
    return normalizeProductionEmail(settings.invoiceCopyTo);
  }
  return normalizeProductionEmail(settings.copyToEmail || getInquiryRecipient(settings));
}

import { applyTemplateVariables } from "@/lib/email/variables";

export function applyEmailTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return applyTemplateVariables(template, vars);
}

export async function resolveFlowEmailSender(
  flow: "general" | "quote" | "invoice" | "security",
  settings?: SiteEmailSettings,
): Promise<ResolvedEmailSender> {
  const email = settings ?? (await getEmailSettings());
  const base = await resolveEmailSender(email);

  const flowSenderRaw =
    flow === "quote"
      ? email.quoteSenderEmail?.trim()
      : flow === "invoice"
        ? email.invoiceSenderEmail?.trim()
        : flow === "security"
          ? email.passwordResetSenderEmail?.trim() || email.securityNotificationSender?.trim()
          : "";

  const flowReplyRaw =
    flow === "quote"
      ? email.quoteReplyTo?.trim()
      : flow === "invoice"
        ? email.invoiceReplyTo?.trim()
        : "";

  const flowSender = flowSenderRaw ? normalizeProductionEmail(flowSenderRaw) : "";
  const flowReply = flowReplyRaw ? normalizeProductionEmail(flowReplyRaw) : "";

  if (flowSender && flowSender !== DEFAULT_COMPANY_EMAIL) {
    const liveCheck = await checkResendDomainLive(flowSender);
    if (liveCheck.state === "verified") {
      const senderName = normalizeSenderName(email.branding?.senderName || email.senderName);
      return {
        ...base,
        from: `${senderName} <${flowSender}>`,
        replyTo: flowReply || base.replyTo,
        displayFrom: `${senderName} <${flowSender}>`,
        usesTestDomain: false,
        domainStatus: "verified",
        domainVerification: "verified",
      };
    }
  }

  return { ...base, replyTo: flowReply || base.replyTo };
}

/** @deprecated use getInquiryRecipient or getCopyEmailForDocument */
export function getNotificationEmailFromSettings(settings: SiteEmailSettings): string {
  return getInquiryRecipient(settings);
}
