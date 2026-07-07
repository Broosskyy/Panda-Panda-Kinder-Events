import type { Domain } from "resend";
import { DEFAULT_COMPANY_DOMAIN, DEFAULT_COMPANY_EMAIL } from "@/lib/email/constants";

export type DomainVerificationDisplay = "verified" | "not_verified" | "unknown";

export interface ResendDomainLiveCheck {
  state: DomainVerificationDisplay;
  domain: string | null;
  resendStatus: string | null;
  message: string;
  label: string;
  checkedAt: string;
}

const VERIFIED_RESEND_STATUSES = new Set(["verified", "partially_verified"]);

function extractDomain(email: string): string | null {
  const match = email.trim().match(/@([^@\s]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export function normalizeDomainName(domain: string): string {
  return domain.trim().toLowerCase().replace(/\.$/, "");
}

function domainsMatch(emailDomain: string, resendDomainName: string): boolean {
  const left = normalizeDomainName(emailDomain);
  const right = normalizeDomainName(resendDomainName);
  return left === right || left.endsWith(`.${right}`);
}

function isVerifiedResendStatus(status: string | null | undefined): boolean {
  if (!status) return false;
  return VERIFIED_RESEND_STATUSES.has(status.trim().toLowerCase());
}

function buildResult(
  state: DomainVerificationDisplay,
  domain: string | null,
  resendStatus: string | null,
  message: string,
): ResendDomainLiveCheck {
  const label =
    state === "verified"
      ? "🟢 Domain verifiziert"
      : state === "not_verified"
        ? "🔴 Domain nicht verifiziert"
        : "🟡 Status unbekannt";

  return {
    state,
    domain,
    resendStatus,
    message,
    label,
    checkedAt: new Date().toISOString(),
  };
}

async function listAllResendDomains(resend: import("resend").Resend): Promise<Domain[]> {
  const all: Domain[] = [];
  let after: string | undefined;

  for (let page = 0; page < 20; page++) {
    const { data, error } = await resend.domains.list({
      limit: 100,
      ...(after ? { after } : {}),
    });

    if (error) {
      throw new Error(error.message);
    }

    const batch = data?.data ?? [];
    all.push(...batch);

    if (!data?.has_more || batch.length === 0) {
      break;
    }

    after = batch[batch.length - 1]?.id;
  }

  return all;
}

function normalizeSenderEmail(email: string | null | undefined): string {
  const trimmed = email?.trim() ?? "";
  if (!trimmed || trimmed.toLowerCase().endsWith("@resend.dev")) {
    return DEFAULT_COMPANY_EMAIL;
  }
  return trimmed;
}

export async function checkResendDomainLive(senderEmail?: string | null): Promise<ResendDomainLiveCheck> {
  const productionEmail = normalizeSenderEmail(senderEmail ?? DEFAULT_COMPANY_EMAIL);
  const domain = extractDomain(productionEmail) ?? DEFAULT_COMPANY_DOMAIN;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return buildResult(
      "unknown",
      domain,
      null,
      "RESEND_API_KEY ist nicht gesetzt — Live-Prüfung nicht möglich.",
    );
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const domains = await listAllResendDomains(resend);
    const match = domains.find((entry) => domainsMatch(domain, entry.name));

    if (!match) {
      return buildResult(
        "not_verified",
        domain,
        null,
        `Domain „${domain}" wurde in Resend nicht gefunden.`,
      );
    }

    const detail = await resend.domains.get(match.id);
    if (detail.error) {
      return buildResult(
        "unknown",
        domain,
        match.status ?? null,
        `Resend-Details nicht abrufbar: ${detail.error.message}`,
      );
    }

    const liveStatus = detail.data?.status ?? match.status ?? null;
    const normalizedStatus = liveStatus?.toLowerCase() ?? null;

    if (isVerifiedResendStatus(normalizedStatus)) {
      return buildResult(
        "verified",
        detail.data?.name ?? match.name,
        normalizedStatus,
        `Domain „${detail.data?.name ?? match.name}" ist in Resend verifiziert.`,
      );
    }

    return buildResult(
      "not_verified",
      detail.data?.name ?? match.name,
      normalizedStatus,
      `Domain „${detail.data?.name ?? match.name}" hat Status „${normalizedStatus ?? "unbekannt"}".`,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return buildResult("unknown", domain, null, `Resend API nicht erreichbar: ${message}`);
  }
}
