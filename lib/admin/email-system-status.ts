import { getEmailSettings } from "@/lib/email/sender";
import { getResendSendingSetup } from "@/lib/email/resend-status";
import { checkResendDomainLive } from "@/lib/email/resend-domain-check";
import { listEmailLogs } from "@/lib/email/log";
import { isEmailTestModeActive } from "@/lib/email/test-mode";
import { DEFAULT_COMPANY_EMAIL } from "@/lib/email/constants";
import type { SystemStatusItem, SystemStatusLevel } from "@/lib/admin/system-status";
import {
  API_CHECK_UNAVAILABLE_MESSAGE,
  computeStatusSummary,
  softenUnavailableApiLevel,
} from "@/lib/admin/status-summary";

function levelFromResend(level: string, message: string): SystemStatusLevel {
  if (level === "ok") return "ok";
  if (level === "error") return softenUnavailableApiLevel("error", message);
  return "warn";
}

function isTestEmailLog(log: { template_slug: string | null; subject: string; status: string }): boolean {
  return log.status === "sent" && (log.template_slug === "test" || log.subject.includes("Test-E-Mail"));
}

/** Laienfreundlicher E-Mail-Systemstatus für Admin → E-Mail → Systemstatus */
export async function getEmailSystemStatus(): Promise<{
  items: SystemStatusItem[];
  summary: { ok: number; warn: number; error: number };
  overall: SystemStatusLevel;
}> {
  const items: SystemStatusItem[] = [];
  const email = await getEmailSettings();
  const resendOk = Boolean(process.env.RESEND_API_KEY);
  const liveDomain = await checkResendDomainLive(email.senderEmail);
  const senderDomain = email.senderEmail?.includes("@") ? email.senderEmail.split("@")[1] : null;

  items.push({
    id: "resend_domain_live",
    label: "Versand-Domain (Resend)",
    level: liveDomain.state === "verified" ? "ok" : liveDomain.state === "unknown" ? "warn" : "error",
    message:
      liveDomain.state === "unknown"
        ? API_CHECK_UNAVAILABLE_MESSAGE
        : liveDomain.state === "verified"
          ? `Domain „${liveDomain.domain ?? senderDomain}" ist verifiziert und kann zum Versand genutzt werden.`
          : `Domain „${liveDomain.domain ?? senderDomain}" ist in Resend noch nicht verifiziert.`,
    action:
      liveDomain.state === "verified"
        ? undefined
        : liveDomain.state === "unknown"
          ? "Wenn E-Mails bereits ankommen, ist alles in Ordnung — die automatische Prüfung war nur nicht möglich."
          : `Resend-Dashboard öffnen und Domain „${liveDomain.domain ?? senderDomain ?? "pb-kinderevents.de"}" verifizieren.`,
  });

  items.push({
    id: "domain_connected",
    label: "Absender-Domain hinterlegt",
    level: senderDomain ? "ok" : "warn",
    message: senderDomain
      ? `Versand über: ${senderDomain}`
      : "Es ist noch keine Absender-E-Mail mit Domain hinterlegt.",
    action: senderDomain ? undefined : "Einstellungen → E-Mail → Absender-E-Mail setzen.",
  });

  items.push({
    id: "resend_connected",
    label: "Versand-Dienst verbunden",
    level: resendOk ? "ok" : "error",
    message: resendOk
      ? "Der automatische E-Mail-Versand ist eingerichtet."
      : "Der Versand-Dienst ist nicht verbunden — automatische E-Mails können nicht gesendet werden.",
    action: resendOk ? undefined : "RESEND_API_KEY in den Server-Einstellungen setzen.",
  });

  items.push({
    id: "zoho_reachable",
    label: "Hauptpostfach hinterlegt",
    level: email.companyEmail?.includes("@") ? "ok" : "warn",
    message: email.companyEmail?.includes("@")
      ? `Firmen-E-Mail: ${email.companyEmail}`
      : "Optional — Firmen-E-Mail für Rückfragen noch nicht gesetzt.",
    action: email.companyEmail?.includes("@") ? undefined : "Einstellungen → E-Mail → Firmen-E-Mail setzen.",
  });

  if (resendOk) {
    try {
      const setup = await getResendSendingSetup(email.senderEmail);
      const friendlyLabels: Record<string, string> = {
        domain_dkim: "DKIM (E-Mail-Signatur)",
        spf_txt: "SPF (Absender-Berechtigung)",
        sending_mx: "MX für Versand",
        from_address: "Absender-Adresse freigegeben",
        api_key: "API-Verbindung",
      };

      for (const item of setup.sending) {
        if (item.id === "api_key") continue;
        const label = friendlyLabels[item.id] ?? item.label;
        const level = levelFromResend(item.level, item.message);
        items.push({
          id: `email_${item.id}`,
          label,
          level,
          message:
            level === "warn" && item.level === "error"
              ? API_CHECK_UNAVAILABLE_MESSAGE
              : item.message,
        });
      }

      items.push({
        id: "dmarc",
        label: "DMARC (Schutz vor Fälschungen)",
        level: "warn",
        message:
          setup.sending.some((s) => s.id === "domain_dkim" && s.level === "ok")
            ? "Optional — DMARC-Eintrag beim Domain-Anbieter prüfen (empfohlen)."
            : "Optional — DMARC kann eingerichtet werden, sobald DKIM/SPF aktiv sind.",
      });

      items.push({
        id: "api_reachable",
        label: "Versand bereit",
        level: setup.canSend ? "ok" : liveDomain.state === "unknown" ? "warn" : "error",
        message: setup.canSend
          ? "E-Mails können versendet werden."
          : liveDomain.state === "unknown"
            ? API_CHECK_UNAVAILABLE_MESSAGE
            : setup.blockReason ?? "Versand ist noch nicht freigegeben.",
      });
    } catch {
      items.push({
        id: "api_reachable",
        label: "Versand bereit",
        level: "warn",
        message: API_CHECK_UNAVAILABLE_MESSAGE,
      });
    }
  }

  const testMode = await isEmailTestModeActive();
  items.push({
    id: "test_mode",
    label: "Testmodus",
    level: testMode ? "warn" : "ok",
    message: testMode
      ? `Aktiv — alle E-Mails gehen an ${email.testMode.testAddress}`
      : "Inaktiv — echte Empfänger werden angeschrieben.",
  });

  try {
    const logs = await listEmailLogs(30);
    const lastTest = logs.find(isTestEmailLog);
    const lastSuccess = logs.find((l) => l.status === "sent");
    const lastFailed = logs.find((l) => l.status === "failed");

    items.push({
      id: "email_test",
      label: "Test-E-Mail erfolgreich",
      level: lastTest ? "ok" : resendOk ? "warn" : "warn",
      message: lastTest
        ? `Letzte erfolgreiche Test-E-Mail: ${new Date(lastTest.created_at).toLocaleString("de-DE")}`
        : "Noch keine Test-E-Mail im Protokoll — bitte unten eine Testmail senden.",
      action: lastTest ? undefined : "Test-E-Mail senden (Formular unten).",
    });

    items.push({
      id: "last_success",
      label: "Letzter erfolgreicher Versand",
      level: lastSuccess ? "ok" : resendOk ? "warn" : "warn",
      message: lastSuccess
        ? `${lastSuccess.subject} — ${new Date(lastSuccess.created_at).toLocaleString("de-DE")}`
        : "Noch kein erfolgreicher Versand im Protokoll.",
      action: lastSuccess ? undefined : "Test-E-Mail senden.",
    });

    items.push({
      id: "last_error",
      label: "Letzter Fehler",
      level: lastFailed ? "error" : "ok",
      message: lastFailed
        ? `${lastFailed.error_message ?? "Unbekannter Fehler"} (${new Date(lastFailed.created_at).toLocaleString("de-DE")})`
        : "Keine fehlgeschlagenen E-Mails im aktuellen Protokoll.",
    });
  } catch {
    items.push({
      id: "email_test",
      label: "Test-E-Mail erfolgreich",
      level: "warn",
      message: "Versandprotokoll konnte nicht gelesen werden.",
    });
  }

  items.push({
    id: "main_address",
    label: "Hauptadresse",
    level: (email.companyEmail || DEFAULT_COMPANY_EMAIL).includes("@") ? "ok" : "warn",
    message: email.companyEmail || DEFAULT_COMPANY_EMAIL,
  });

  const summary = computeStatusSummary(items);

  return { items, summary, overall: summary.overall };
}
