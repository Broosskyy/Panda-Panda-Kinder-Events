import type { DomainRecords } from "resend";
import { API_CHECK_UNAVAILABLE_MESSAGE } from "@/lib/email/domain-status-copy";
import { normalizeProductionEmail } from "./sender";
import { checkResendDomainLive } from "./resend-domain-check";
import { DEFAULT_COMPANY_EMAIL } from "./constants";

export type ResendStatusLevel = "ok" | "warn" | "error" | "optional";

export interface ResendStatusItem {
  id: string;
  label: string;
  level: ResendStatusLevel;
  message: string;
}

export interface ResendSendingSetup {
  apiKeySet: boolean;
  domain: string | null;
  canSend: boolean;
  blockReason?: string;
  sending: ResendStatusItem[];
  receiving: ResendStatusItem[];
}

function isRecordVerified(records: DomainRecords[] | undefined, matcher: (r: DomainRecords) => boolean): boolean {
  return Boolean(records?.some((r) => matcher(r) && r.status === "verified"));
}

function extractDomain(email: string): string | null {
  const match = email.trim().match(/@([^@\s]+)$/);
  return match?.[1]?.toLowerCase() ?? null;
}

function isResendTestDomain(email: string): boolean {
  return email.toLowerCase().endsWith("@resend.dev");
}

export async function getResendSendingSetup(senderEmail: string): Promise<ResendSendingSetup> {
  const productionEmail = normalizeProductionEmail(senderEmail);
  const apiKeySet = Boolean(process.env.RESEND_API_KEY);
  const domain = extractDomain(productionEmail);
  const sending: ResendStatusItem[] = [];
  const receiving: ResendStatusItem[] = [];

  sending.push({
    id: "api_key",
    label: "API Key gesetzt",
    level: apiKeySet ? "ok" : "error",
    message: apiKeySet ? "RESEND_API_KEY ist gesetzt." : "RESEND_API_KEY fehlt — Versand deaktiviert.",
  });

  if (!productionEmail.trim()) {
    sending.push({
      id: "from_address",
      label: "From-Adresse erlaubt",
      level: "error",
      message: `Absender-E-Mail fehlt — Fallback: ${DEFAULT_COMPANY_EMAIL}.`,
    });
    return {
      apiKeySet,
      domain,
      canSend: false,
      blockReason: "Absender-Adresse ungültig.",
      sending,
      receiving: [
        {
          id: "receiving",
          label: "Empfang (optional)",
          level: "optional",
          message: "Optional — externes Mailhosting möglich.",
        },
      ],
    };
  }

  if (isResendTestDomain(productionEmail)) {
    sending.push({
      id: "from_address",
      label: "From-Adresse erlaubt",
      level: "error",
      message: `Ungültige Test-Absenderadresse — es wird ${DEFAULT_COMPANY_EMAIL} verwendet.`,
    });
    return {
      apiKeySet,
      domain,
      canSend: false,
      blockReason: "Produktionsadresse erforderlich.",
      sending,
      receiving: [
        {
          id: "receiving",
          label: "Empfang (optional)",
          level: "optional",
          message: "Optional — externes Mailhosting möglich.",
        },
      ],
    };
  }

  const liveCheck = await checkResendDomainLive(productionEmail);

  if (!apiKeySet) {
    sending.push({
      id: "domain_dkim",
      label: "Domain DKIM verified",
      level: "warn",
      message: liveCheck.message,
    });
    receiving.push({
      id: "receiving",
      label: "Empfang (optional)",
      level: "optional",
      message: "Optional — nicht geprüft ohne API Key.",
    });
    return {
      apiKeySet: false,
      domain,
      canSend: false,
      blockReason: "RESEND_API_KEY fehlt.",
      sending,
      receiving,
    };
  }

  let records: DomainRecords[] | undefined;
  let capabilities: { sending?: string; receiving?: string } | undefined;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { data } = await resend.domains.list();
    const match = data?.data?.find((d) => d.name === domain || (domain && domain.endsWith(`.${d.name}`)));
    if (match) {
      const detail = await resend.domains.get(match.id);
      records = detail.data?.records;
      capabilities = detail.data?.capabilities;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    sending.push({
      id: "domain_lookup",
      label: "Domain-Status",
      level: "warn",
      message: `Domain-Details nicht abrufbar: ${message}`,
    });
  }

  const dkimOk = isRecordVerified(records, (r) => r.record === "DKIM");
  const spfTxtOk = isRecordVerified(records, (r) => r.record === "SPF" && r.type === "TXT");
  const spfMxOk = isRecordVerified(records, (r) => r.record === "SPF" && r.type === "MX");
  const domainVerified = liveCheck.state === "verified";

  sending.push({
    id: "domain_dkim",
    label: "Domain DKIM verified",
    level: dkimOk || domainVerified ? "ok" : liveCheck.state === "not_verified" ? "error" : "warn",
    message: dkimOk
      ? "DKIM-Eintrag ist verifiziert."
      : domainVerified
        ? "Domain verifiziert (DKIM-Details nicht verfügbar)."
        : liveCheck.state === "unknown"
          ? API_CHECK_UNAVAILABLE_MESSAGE
          : `DKIM noch nicht verifiziert — ${liveCheck.message}`,
  });

  sending.push({
    id: "spf_txt",
    label: "Sending SPF TXT verified",
    level: spfTxtOk || domainVerified ? "ok" : "warn",
    message: spfTxtOk
      ? "SPF-TXT-Eintrag ist verifiziert."
      : domainVerified
        ? "Domain verifiziert (SPF-Details nicht verfügbar)."
        : "SPF-TXT noch nicht verifiziert.",
  });

  sending.push({
    id: "sending_mx",
    label: "Sending MX verified",
    level: spfMxOk || domainVerified ? "ok" : "warn",
    message: spfMxOk
      ? "Sending-MX-Eintrag ist verifiziert."
      : domainVerified
        ? "Domain verifiziert."
        : "Sending-MX noch nicht verifiziert (falls von Resend gefordert).",
  });

  sending.push({
    id: "from_address",
    label: "From-Adresse erlaubt",
    level: domainVerified ? "ok" : liveCheck.state === "unknown" ? "warn" : "error",
    message: domainVerified
      ? `Absender ${productionEmail} kann verwendet werden.`
      : liveCheck.state === "unknown"
        ? API_CHECK_UNAVAILABLE_MESSAGE
        : `Domain nicht verifiziert — ${liveCheck.message}`,
  });

  const receivingEnabled = capabilities?.receiving === "enabled";
  const receivingMxOk = isRecordVerified(records, (r) => r.record === "Receiving");

  if (!receivingEnabled) {
    receiving.push({
      id: "receiving",
      label: "Empfang (optional)",
      level: "optional",
      message: "Optional / nicht aktiv — Empfang über externes Mailhosting möglich.",
    });
  } else if (receivingMxOk) {
    receiving.push({
      id: "receiving",
      label: "Empfang (optional)",
      level: "optional",
      message: "Receiving-MX verifiziert.",
    });
  } else {
    receiving.push({
      id: "receiving",
      label: "Empfang (optional)",
      level: "optional",
      message: "Receiving aktiviert, MX noch nicht verifiziert — kein Blocker für Versand.",
    });
  }

  const canSend = apiKeySet && (domainVerified || liveCheck.state === "unknown");
  return {
    apiKeySet,
    domain: liveCheck.domain ?? domain,
    canSend,
    blockReason: canSend
      ? undefined
      : !apiKeySet
        ? "RESEND_API_KEY fehlt."
        : liveCheck.state === "unknown"
          ? API_CHECK_UNAVAILABLE_MESSAGE
          : "Absender-Domain ist noch nicht verifiziert.",
    sending,
    receiving,
  };
}
