import type { DomainRecords } from "resend";
import { checkResendDomainStatus, RESEND_TEST_FROM } from "./sender";

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
  const apiKeySet = Boolean(process.env.RESEND_API_KEY);
  const domain = extractDomain(senderEmail);
  const sending: ResendStatusItem[] = [];
  const receiving: ResendStatusItem[] = [];

  sending.push({
    id: "api_key",
    label: "API Key gesetzt",
    level: apiKeySet ? "ok" : "error",
    message: apiKeySet ? "RESEND_API_KEY ist gesetzt." : "RESEND_API_KEY fehlt — Versand deaktiviert.",
  });

  if (!senderEmail.trim()) {
    sending.push({
      id: "from_address",
      label: "From-Adresse erlaubt",
      level: "error",
      message: "Absender-E-Mail ist nicht konfiguriert.",
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

  if (isResendTestDomain(senderEmail)) {
    sending.push({
      id: "domain_dkim",
      label: "Domain DKIM verified",
      level: "warn",
      message: `Testdomain ${RESEND_TEST_FROM} — nur für Entwicklung.`,
    });
    sending.push({
      id: "from_address",
      label: "From-Adresse erlaubt",
      level: "warn",
      message: "Testdomain aktiv — Empfänger auf verifizierte Adressen beschränkt.",
    });
    receiving.push({
      id: "receiving",
      label: "Empfang (optional)",
      level: "optional",
      message: "Nicht aktiv — Empfang kann über externes Mailhosting laufen.",
    });
    return {
      apiKeySet,
      domain: "resend.dev",
      canSend: apiKeySet,
      blockReason: apiKeySet ? undefined : "RESEND_API_KEY fehlt.",
      sending,
      receiving,
    };
  }

  const domainCheck = await checkResendDomainStatus(senderEmail);

  if (!apiKeySet) {
    sending.push({
      id: "domain_dkim",
      label: "Domain DKIM verified",
      level: "warn",
      message: domainCheck.message,
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
  const domainVerified = domainCheck.status === "verified";

  sending.push({
    id: "domain_dkim",
    label: "Domain DKIM verified",
    level: dkimOk || domainVerified ? "ok" : domainCheck.status === "failed" ? "error" : "warn",
    message: dkimOk
      ? "DKIM-Eintrag ist verifiziert."
      : domainVerified
        ? "Domain verifiziert (DKIM-Details nicht verfügbar)."
        : `DKIM noch nicht verifiziert — ${domainCheck.message}`,
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
    level: domainVerified ? "ok" : "error",
    message: domainVerified
      ? `Absender ${senderEmail} kann verwendet werden.`
      : `Domain noch nicht verifiziert — ${domainCheck.message}`,
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

  const canSend = apiKeySet && domainVerified;
  return {
    apiKeySet,
    domain: domainCheck.domain ?? domain,
    canSend,
    blockReason: canSend
      ? undefined
      : !apiKeySet
        ? "RESEND_API_KEY fehlt."
        : "Absender-Domain ist noch nicht verifiziert.",
    sending,
    receiving,
  };
}
