import { getEmailSettings } from "@/lib/email/sender";
import { getResendSendingSetup } from "@/lib/email/resend-status";
import { fetchSiteSettings } from "@/lib/cms/data";
import { resolvePublicSiteUrl } from "@/lib/cms/resolve-settings";
import { getSiteUrl } from "@/lib/site-url";
import { isSupabaseConfigured } from "@/lib/supabase/admin";

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
    id: "resend",
    label: "Resend verbunden",
    level: resendOk ? "ok" : "error",
    message: resendOk ? "RESEND_API_KEY ist gesetzt." : "E-Mail-Versand deaktiviert.",
    action: resendOk ? undefined : "RESEND_API_KEY in Vercel setzen.",
  });

  if (resendOk) {
    try {
      const email = await getEmailSettings();
      const sendingSetup = await getResendSendingSetup(email.senderEmail);
      for (const item of sendingSetup.sending) {
        items.push({
          id: `resend_${item.id}`,
          label: item.label,
          level: item.level === "optional" ? "warn" : item.level === "ok" ? "ok" : item.level === "warn" ? "warn" : "error",
          message: item.message,
          action:
            item.level === "error" && item.id === "from_address"
              ? "Domain in Resend verifizieren (DOMAIN_EMAIL_SETUP_GUIDE.md)."
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
        label: "Resend Domain verifiziert",
        level: "warn",
        message: "Domain-Status konnte nicht geprüft werden.",
      });
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const cmsUrl = resolvePublicSiteUrl(settings);
  const domainSet = Boolean(envUrl || settings.seo.primaryDomain || settings.seo.canonicalBaseUrl);
  items.push({
    id: "domain",
    label: "Domain gesetzt",
    level: domainSet ? "ok" : "warn",
    message: domainSet ? `Aktive URL: ${cmsUrl}` : "Keine Domain konfiguriert.",
    action: domainSet ? undefined : "NEXT_PUBLIC_SITE_URL oder SEO-Einstellungen setzen.",
  });

  const senderSet = Boolean(settings.email.senderEmail?.trim());
  items.push({
    id: "email_sender",
    label: "E-Mail-Absender gesetzt",
    level: senderSet ? "ok" : "warn",
    message: senderSet ? settings.email.senderEmail : "Absender-E-Mail fehlt.",
    action: senderSet ? undefined : "Einstellungen → E-Mail → Absender-E-Mail.",
  });

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

  const analyticsActive = Boolean(settings.seo.googleAnalyticsId?.trim());
  items.push({
    id: "analytics",
    label: "Analytics",
    level: analyticsActive ? "ok" : "warn",
    message: analyticsActive ? "Google Analytics ID gesetzt." : "Analytics optional — noch nicht konfiguriert.",
  });

  items.push({
    id: "backup",
    label: "Backup",
    level: "warn",
    message: "Manuelles Backup über Supabase Dashboard empfohlen.",
    action: "backups/checkpoint-v1/DATABASE_BACKUP_GUIDE.md",
  });

  items.push({
    id: "migrations",
    label: "Migrationen",
    level: supabaseOk ? "ok" : "warn",
    message: supabaseOk ? "Letzte Migration: 20260714_admin_control_center (Control Center)." : "Migrationen nicht prüfbar.",
  });

  const summary = {
    ok: items.filter((i) => i.level === "ok").length,
    warn: items.filter((i) => i.level === "warn").length,
    error: items.filter((i) => i.level === "error").length,
  };

  return { items, summary };
}

export function getEnvSiteUrlHint(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || getSiteUrl();
}
