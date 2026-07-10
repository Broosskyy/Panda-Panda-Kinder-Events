import { getAppVersion, getBuildLabel, getDeployEnvironment } from "@/lib/admin/build-info";
import { isPushConfigured } from "@/lib/admin/push/config";
import { getEmailSettings } from "@/lib/email/sender";
import { getResendSendingSetup } from "@/lib/email/resend-status";
import { fetchSiteSettings } from "@/lib/cms/data";
import { resolvePublicSiteUrl } from "@/lib/cms/resolve-settings";
import { getSiteUrl } from "@/lib/site-url";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listEmailLogs } from "@/lib/email/log";
import { DEFAULT_COMPANY_EMAIL } from "@/lib/email/constants";
import { resolveGoogleIntegrations } from "@/lib/system-config";
import {
  API_CHECK_UNAVAILABLE_MESSAGE,
  DOMAIN_MANUAL_CONFIRM_MESSAGE,
  isTestEmailLog,
} from "@/lib/email/domain-status-copy";
import {
  computeStatusSummary,
  softenUnavailableApiLevel,
  softenWhenTestMailSucceeded,
} from "@/lib/admin/status-summary";

export type SystemStatusLevel = "ok" | "warn" | "error";

export interface SystemStatusItem {
  id: string;
  label: string;
  level: SystemStatusLevel;
  message: string;
  action?: string;
}

export async function getSystemStatus(): Promise<{
  items: SystemStatusItem[];
  summary: { ok: number; warn: number; error: number };
  overall: SystemStatusLevel;
}> {
  const items: SystemStatusItem[] = [];
  const settings = await fetchSiteSettings();

  const supabaseOk = isSupabaseConfigured();
  items.push({
    id: "supabase",
    label: "Supabase verbunden",
    level: supabaseOk ? "ok" : "error",
    message: supabaseOk ? "Datenbank erreichbar." : "Supabase-Umgebungsvariablen fehlen.",
    action: supabaseOk ? undefined : "NEXT_PUBLIC_SUPABASE_URL und Keys in Vercel setzen.",
  });

  items.push({
    id: "storage",
    label: "Storage verbunden",
    level: supabaseOk ? "ok" : "warn",
    message: supabaseOk ? "Storage über Supabase verfügbar." : "Storage benötigt Supabase.",
    action: supabaseOk ? undefined : "Supabase konfigurieren.",
  });

  const resendOk = Boolean(process.env.RESEND_API_KEY);
  items.push({
    id: "email_ready",
    label: "E-Mail-Versand bereit",
    level: resendOk ? "ok" : "error",
    message: resendOk
      ? "Resend ist verbunden — automatische Website-E-Mails können versendet werden."
      : "E-Mail-Versand ist deaktiviert, weil der Versand-Dienst nicht verbunden ist.",
    action: resendOk ? undefined : "RESEND_API_KEY in den Server-Einstellungen setzen.",
  });

  items.push({
    id: "resend",
    label: "Resend verbunden",
    level: resendOk ? "ok" : "error",
    message: resendOk ? "Versand-Dienst (Resend) ist eingerichtet." : "Versand-Dienst fehlt.",
    action: resendOk ? undefined : "RESEND_API_KEY in Vercel setzen.",
  });

  const mainEmail =
    settings.email.senderEmail?.trim() ||
    settings.email.companyEmail?.trim() ||
    settings.contact.email?.trim() ||
    DEFAULT_COMPANY_EMAIL;
  items.push({
    id: "main_email",
    label: "Hauptadresse gesetzt",
    level: mainEmail.includes("@") ? "ok" : "warn",
    message: mainEmail.includes("@") ? `Hauptadresse: ${mainEmail}` : "Keine Haupt-E-Mail-Adresse hinterlegt.",
    action: mainEmail.includes("@") ? undefined : "Einstellungen → E-Mail → Absender-E-Mail setzen.",
  });

  if (resendOk) {
    let hasSuccessfulTest = false;
    try {
      const logs = await listEmailLogs(20);
      hasSuccessfulTest = logs.some(isTestEmailLog);
    } catch {
      hasSuccessfulTest = false;
    }

    try {
      const email = await getEmailSettings();
      const sendingSetup = await getResendSendingSetup(email.senderEmail);
      for (const item of sendingSetup.sending) {
        const rawLevel =
          item.level === "optional" ? "warn" : item.level === "ok" ? "ok" : item.level === "warn" ? "warn" : "error";
        let level = softenUnavailableApiLevel(rawLevel, item.message);
        level = softenWhenTestMailSucceeded(level, item.message, hasSuccessfulTest);
        let message = item.message;
        if (hasSuccessfulTest && level === "ok" && rawLevel !== "ok") {
          message = DOMAIN_MANUAL_CONFIRM_MESSAGE;
        } else if (level === "warn" && rawLevel === "error") {
          message = API_CHECK_UNAVAILABLE_MESSAGE;
        }
        items.push({
          id: `resend_${item.id}`,
          label: item.label,
          level,
          message,
          action:
            level === "error" && item.id === "from_address"
              ? "Domain im Resend-Dashboard verifizieren."
              : undefined,
        });
      }
      for (const item of sendingSetup.receiving) {
        items.push({
          id: `resend_${item.id}`,
          label: item.label,
          level: "ok",
          message: item.message,
        });
      }
    } catch {
      items.push({
        id: "resend_domain",
        label: "Domain-Verifizierung (Resend)",
        level: "warn",
        message: API_CHECK_UNAVAILABLE_MESSAGE,
      });
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const cmsUrl = resolvePublicSiteUrl(settings);
  const displayUrl = (envUrl || cmsUrl || getSiteUrl()).replace(/\/$/, "");
  const hasExplicitConfig = Boolean(
    envUrl ||
      settings.seo.primaryDomain?.trim() ||
      settings.seo.canonicalBaseUrl?.trim() ||
      settings.business.website?.trim(),
  );
  items.push({
    id: "domain",
    label: "Domain",
    level: displayUrl ? "ok" : "warn",
    message: displayUrl
      ? hasExplicitConfig
        ? `Aktive Website: ${displayUrl}`
        : `Website erreichbar unter: ${displayUrl}`
      : "Keine Domain konfiguriert.",
    action: displayUrl ? undefined : "NEXT_PUBLIC_SITE_URL oder SEO-Einstellungen setzen.",
  });

  const sslActive = Boolean(displayUrl?.startsWith("https://"));
  items.push({
    id: "ssl",
    label: "SSL / HTTPS",
    level: sslActive ? "ok" : displayUrl ? "warn" : "warn",
    message: sslActive
      ? "Website-URL nutzt HTTPS."
      : displayUrl
        ? "Website-URL ohne HTTPS — für Produktion HTTPS aktivieren."
        : "SSL-Status erst nach Domain-Konfiguration prüfbar.",
    action: sslActive ? undefined : "Custom Domain mit HTTPS (z. B. Vercel) verbinden.",
  });

  items.push({
    id: "smtp",
    label: "SMTP / Versand",
    level: resendOk ? "ok" : "warn",
    message: resendOk
      ? "Resend (SMTP-API) ist verbunden — Versand über zentrale Mail-Konfiguration."
      : "Vorbereitet — RESEND_API_KEY fehlt noch, Versand ist deaktiviert.",
    action: resendOk ? undefined : "RESEND_API_KEY in den Server-Einstellungen setzen.",
  });

  const pushReady = isPushConfigured();
  items.push({
    id: "push",
    label: "Push",
    level: pushReady ? "ok" : "warn",
    message: pushReady
      ? "Web-Push (VAPID) ist konfiguriert."
      : "Vorbereitet — VAPID-Keys fehlen noch (NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY).",
    action: pushReady ? undefined : "VAPID-Keys in Vercel setzen.",
  });

  const senderSet = Boolean(settings.email.senderEmail?.trim());
  items.push({
    id: "email_sender",
    label: "E-Mail-Absender gesetzt",
    level: senderSet ? "ok" : "warn",
    message: senderSet ? settings.email.senderEmail : "Absender-E-Mail fehlt.",
    action: senderSet ? undefined : "Einstellungen → E-Mail → Absender-E-Mail.",
  });

  try {
    const logs = await listEmailLogs(20);
    const lastTest = logs.find(
      (l) =>
        l.status === "sent" &&
        (l.template_slug === "test" || l.subject?.includes("Test-E-Mail")),
    );
    items.push({
      id: "email_test",
      label: "Test-E-Mail erfolgreich",
      level: lastTest ? "ok" : resendOk ? "warn" : "warn",
      message: lastTest
        ? `Letzte erfolgreiche Test-E-Mail: ${new Date(lastTest.created_at).toLocaleString("de-DE")}`
        : resendOk
          ? "Noch keine Test-E-Mail im Protokoll — bitte unter Einstellungen → E-Mail eine Testmail senden."
          : "Test erst möglich, wenn der Versand-Dienst verbunden ist.",
      action: lastTest ? undefined : "Einstellungen → E-Mail → Test-E-Mail senden.",
    });

    const lastFailed = logs.find((l) => l.status === "failed");
    items.push({
      id: "email_last_error",
      label: "Letzter Fehler",
      level: lastFailed ? "error" : "ok",
      message: lastFailed
        ? `${lastFailed.subject}: ${lastFailed.error_message ?? "Unbekannter Fehler"}`
        : "Keine fehlgeschlagenen E-Mails im aktuellen Protokoll.",
    });
  } catch {
    items.push({
      id: "email_test",
      label: "Test-E-Mail erfolgreich",
      level: "warn",
      message: "Protokoll konnte nicht gelesen werden.",
    });
  }

  const bank = settings.bank;
  const invoiceReady = Boolean(
    settings.business.companyName?.trim() &&
      (bank.iban?.trim() || settings.business.email?.trim()) &&
      settings.business.street?.trim(),
  );
  items.push({
    id: "invoice_data",
    label: "Pflichtdaten für Rechnungen",
    level: invoiceReady ? "ok" : "warn",
    message: invoiceReady ? "Firmenname, Adresse und Kontakt vorhanden." : "Firmenname, Adresse oder IBAN fehlen.",
    action: invoiceReady ? undefined : "Unternehmensdaten und Bank & Steuerdaten ausfüllen.",
  });

  const legalReady = Boolean(
    settings.business.companyName?.trim() &&
      settings.legal.impressumResponsible?.trim() &&
      settings.business.managingDirector?.trim(),
  );
  items.push({
    id: "legal_data",
    label: "Pflichtdaten für Impressum",
    level: legalReady ? "ok" : "warn",
    message: legalReady ? "Impressumsdaten vorhanden." : "Verantwortliche Person oder Impressumstext fehlt.",
    action: legalReady ? undefined : "Rechtliches und Unternehmensdaten ausfüllen.",
  });

  const google = resolveGoogleIntegrations(settings.seo);
  const googleServices: { key: string; id?: string }[] = [
    { key: "GA4", id: google.analyticsId },
    { key: "GTM", id: google.tagManagerId },
    { key: "GSC", id: google.siteVerification },
    { key: "Clarity", id: google.clarityId },
    { key: "Maps", id: google.mapsApiKey },
    { key: "reCAPTCHA", id: google.recaptchaSiteKey },
  ];
  const googleActive = googleServices.filter((s) => s.id);
  const googlePrepared = googleServices.filter((s) => !s.id).map((s) => s.key);
  items.push({
    id: "google",
    label: "Google & Tracking",
    level: googleActive.length > 0 ? "ok" : "warn",
    message:
      googleActive.length > 0
        ? `Eingerichtet: ${googleActive.map((s) => s.key).join(", ")}.${
            googlePrepared.length > 0 ? ` Vorbereitet: ${googlePrepared.join(", ")}.` : ""
          }`
        : "Vorbereitet — noch keine IDs hinterlegt (fehlende IDs verursachen keine Fehler).",
    action:
      googleActive.length === 0
        ? "Einstellungen → Domain & SEO oder ENV-Variablen (optional)."
        : undefined,
  });

  items.push({
    id: "version",
    label: "Version",
    level: "ok",
    message: `App-Version ${getAppVersion()}`,
  });

  items.push({
    id: "build",
    label: "Build",
    level: "ok",
    message: `Build ${getBuildLabel()} (${getDeployEnvironment()})`,
  });

  items.push({
    id: "backup",
    label: "Backup",
    level: "ok",
    message: "Manuelles App-Backup verfügbar.",
    action: "Einstellungen → Systemstatus → Backup",
  });

  items.push({
    id: "migrations",
    label: "Migrationen",
    level: supabaseOk ? "ok" : "warn",
    message: supabaseOk ? "Letzte Migration: 20260714_admin_control_center (Control Center)." : "Migrationen nicht prüfbar.",
  });

  const summary = computeStatusSummary(items);

  return { items, summary, overall: summary.overall };
}

export function getEnvSiteUrlHint(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || getSiteUrl();
}
