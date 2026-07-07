"use client";

import Link from "next/link";
import type { SiteEmailSettings } from "@/lib/cms/types";
import { EmailSettingsPanel } from "@/components/admin/email/EmailSettingsPanel";
import { EmailAliasesPanel } from "@/components/admin/email/EmailAliasesPanel";
import { EmailSignaturePanel } from "@/components/admin/email/EmailSignaturePanel";
import { EmailBrandingPanel } from "@/components/admin/email/EmailBrandingPanel";
import { EmailTestModePanel } from "@/components/admin/email/EmailTestModePanel";
import { EmailSystemStatusPanel } from "@/components/admin/email/EmailSystemStatusPanel";
import type { DomainVerificationDisplay } from "@/lib/email/resend-domain-check";

export type EmailSubTab =
  | "general"
  | "aliases"
  | "signature"
  | "branding"
  | "testmode"
  | "status";

const EMAIL_SUB_TABS: { id: EmailSubTab; label: string; hint: string }[] = [
  { id: "general", label: "Allgemein", hint: "Absender, Texte und Testversand" },
  { id: "aliases", label: "Alias & Weiterleitungen", hint: "info@, kontakt@ und mehr" },
  { id: "signature", label: "Signatur", hint: "Automatische Fußzeile jeder E-Mail" },
  { id: "branding", label: "Branding", hint: "Farben, Logo und Layout" },
  { id: "testmode", label: "Testmodus", hint: "Keine echten Kunden anschreiben" },
  { id: "status", label: "Systemstatus", hint: "Ampel: alles OK?" },
];

interface EmailSettingsShellProps {
  email: SiteEmailSettings;
  emailTab: EmailSubTab;
  testTo: string;
  resendConfigured: boolean;
  domainVerification: DomainVerificationDisplay;
  emailStatusBanner?: React.ReactNode;
  onEmailField: <K extends keyof SiteEmailSettings>(key: K, value: SiteEmailSettings[K]) => void;
  onTestToChange: (value: string) => void;
  onSendTest: () => void;
  onSave: () => void;
}

export function EmailSettingsShell({
  email,
  emailTab,
  testTo,
  resendConfigured,
  domainVerification,
  emailStatusBanner,
  onEmailField,
  onTestToChange,
  onSendTest,
  onSave,
}: EmailSettingsShellProps) {
  return (
    <div>
      <nav className="mb-6 flex flex-wrap gap-2">
        {EMAIL_SUB_TABS.map((tab) => (
          <Link
            key={tab.id}
            href={`/admin/einstellungen?tab=email&emailTab=${tab.id}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              emailTab === tab.id
                ? "bg-primary text-white"
                : "border border-border bg-bg-card text-text-secondary hover:bg-bg-secondary"
            }`}
            title={tab.hint}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {email.testMode?.enabled ? (
        <div className="mb-4 rounded-xl border border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>⚠ Testmodus aktiv</strong> — Es werden keine echten Kunden angeschrieben. Alle E-Mails gehen an{" "}
          <strong>{email.testMode.testAddress || "—"}</strong>.
        </div>
      ) : null}

      {emailStatusBanner}

      {emailTab === "general" ? (
        <EmailSettingsPanel
          email={email}
          testTo={testTo}
          resendConfigured={resendConfigured}
          onEmailField={onEmailField}
          onTestToChange={onTestToChange}
          onSendTest={onSendTest}
          onSave={onSave}
        />
      ) : null}

      {emailTab === "aliases" ? <EmailAliasesPanel /> : null}
      {emailTab === "signature" ? (
        <EmailSignaturePanel email={email} onEmailField={onEmailField} onSave={onSave} />
      ) : null}
      {emailTab === "branding" ? (
        <EmailBrandingPanel email={email} domainVerification={domainVerification} onEmailField={onEmailField} onSave={onSave} />
      ) : null}
      {emailTab === "testmode" ? (
        <EmailTestModePanel email={email} onEmailField={onEmailField} onSave={onSave} onSendTest={onSendTest} testTo={testTo} onTestToChange={onTestToChange} resendConfigured={resendConfigured} />
      ) : null}
      {emailTab === "status" ? <EmailSystemStatusPanel onSendTest={onSendTest} testTo={testTo} onTestToChange={onTestToChange} resendConfigured={resendConfigured} /> : null}
    </div>
  );
}

export function parseEmailSubTab(value: string | null): EmailSubTab {
  const valid: EmailSubTab[] = ["general", "aliases", "signature", "branding", "testmode", "status"];
  return valid.includes(value as EmailSubTab) ? (value as EmailSubTab) : "general";
}
