import { getEmailSettings } from "@/lib/email/sender";
import { getResendSendingSetup } from "@/lib/email/resend-status";
import { checkResendDomainLive } from "@/lib/email/resend-domain-check";
import { listEmailLogs } from "@/lib/email/log";
import { isEmailTestModeActive } from "@/lib/email/test-mode";
import { DEFAULT_COMPANY_EMAIL } from "@/lib/email/constants";
import type { SystemStatusItem, SystemStatusLevel } from "@/lib/admin/system-status";

function levelFromResend(level: string): SystemStatusLevel {
  if (level === "ok") return "ok";
  if (level === "error") return "error";
  return "warn";
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

  items.push({
    id: "resend_domain_live",
    label: "Resend Domain (Live-Check)",
    level: liveDomain.state === "verified" ? "ok" : liveDomain.state === "unknown" ? "warn" : "error",
    message: `${liveDomain.label}${liveDomain.message ? ` — ${liveDomain.message}` : ""}`,
    action:
      liveDomain.state === "verified"
        ? undefined
        : "Resend Dashboard prüfen: Domain pb-kinderevents.de verifizieren.",
  });

  items.push({
    id: "domain_connected",
    label: "Domain verbunden",
    level: email.senderEmail?.includes("@") ? "ok" : "warn",
    message: email.senderEmail?.includes("@")
      ? `Versand-Domain: ${email.senderEmail.split("@")[1]}`
      : "Keine Absender-Domain hinterlegt.",
    action: email.senderEmail?.includes("@") ? undefined : "Einstellungen → E-Mail → Absender-E-Mail setzen.",
  });

  items.push({
    id: "resend_connected",
    label: "Resend verbunden",
    level: resendOk ? "ok" : "error",
    message: resendOk
      ? "Der automatische E-Mail-Dienst ist verbunden."
      : "Der E-Mail-Dienst ist nicht verbunden — automatischer Versand deaktiviert.",
    action: resendOk ? undefined : "RESEND_API_KEY in den Server-Einstellungen setzen.",
  });

  items.push({
    id: "zoho_reachable",
    label: "Zoho erreichbar",
    level: email.companyEmail?.includes("@") ? "ok" : "warn",
    message: email.companyEmail?.includes("@")
      ? `Hauptpostfach konfiguriert: ${email.companyEmail}`
      : "Hauptpostfach noch nicht gesetzt — bitte Firmen-E-Mail prüfen.",
    action: email.companyEmail?.includes("@") ? undefined : "Einstellungen → E-Mail → Firmen-E-Mail setzen.",
  });

  if (resendOk) {
    try {
      const setup = await getResendSendingSetup(email.senderEmail);
      const friendlyLabels: Record<string, string> = {
        domain_dkim: "DKIM (E-Mail-Signatur für Zustellbarkeit)",
        spf_txt: "SPF (Absender-Berechtigung)",
        sending_mx: "MX für Versand",
        from_address: "Absender-Adresse freigegeben",
        api_key: "API-Verbindung",
      };

      for (const item of setup.sending) {
        const label = friendlyLabels[item.id] ?? item.label;
        items.push({
          id: `email_${item.id}`,
          label,
          level: levelFromResend(item.level),
          message: item.message,
        });
      }

      items.push({
        id: "dmarc",
        label: "DMARC (Schutz vor Fälschungen)",
        level: setup.sending.some((s) => s.id === "domain_dkim" && s.level === "ok") ? "ok" : "warn",
        message:
          setup.sending.some((s) => s.id === "domain_dkim" && s.level === "ok")
            ? "Empfohlen: DMARC-Eintrag beim Domain-Anbieter prüfen (Zoho/Resend-Anleitung)."
            : "DMARC kann erst sinnvoll geprüft werden, wenn DKIM/SPF aktiv sind.",
      });

      items.push({
        id: "api_reachable",
        label: "API erreichbar",
        level: setup.canSend ? "ok" : "error",
        message: setup.canSend ? "Versand-API antwortet." : setup.blockReason ?? "Versand blockiert.",
      });
    } catch {
      items.push({
        id: "api_reachable",
        label: "API erreichbar",
        level: "warn",
        message: "Domain-Status konnte nicht vollständig geprüft werden.",
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
    const lastSuccess = logs.find((l) => l.status === "sent");
    const lastFailed = logs.find((l) => l.status === "failed");

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
        ? `${lastFailed.error_message ?? "Unbekannt"} (${new Date(lastFailed.created_at).toLocaleString("de-DE")})`
        : "Keine Fehler im aktuellen Protokoll.",
    });
  } catch {
    items.push({
      id: "last_success",
      label: "Letzter erfolgreicher Versand",
      level: "warn",
      message: "Protokoll nicht lesbar.",
    });
  }

  items.push({
    id: "main_address",
    label: "Hauptadresse",
    level: (email.companyEmail || DEFAULT_COMPANY_EMAIL).includes("@") ? "ok" : "warn",
    message: email.companyEmail || DEFAULT_COMPANY_EMAIL,
  });

  const summary = {
    ok: items.filter((i) => i.level === "ok").length,
    warn: items.filter((i) => i.level === "warn").length,
    error: items.filter((i) => i.level === "error").length,
  };

  const overall: SystemStatusLevel =
    summary.error > 0 ? "error" : summary.warn > 0 ? "warn" : "ok";

  return { items, summary, overall };
}
