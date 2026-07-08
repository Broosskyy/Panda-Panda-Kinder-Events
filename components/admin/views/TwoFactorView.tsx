"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Download, Shield } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_MSG } from "@/lib/admin/messages";

type Step = "idle" | "setup" | "enabled";

export function TwoFactorView() {
  const [step, setStep] = useState<Step>("idle");
  const [enabled, setEnabled] = useState(false);
  const [backupRemaining, setBackupRemaining] = useState(0);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [regenCode, setRegenCode] = useState("");
  const { toast, withLoading, error: showError } = useAdminMessages();
  const page = adminPageHeaderProps("twoFa");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/security/2fa");
    const data = await res.json();
    if (res.ok) {
      setEnabled(Boolean(data.enabled));
      setBackupRemaining(data.backupCodesRemaining ?? 0);
      setStep(data.enabled ? "enabled" : "idle");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setup = async () => {
    const res = await fetch("/api/admin/security/2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup" }),
    });
    const data = await res.json();
    if (res.ok) {
      setQrDataUrl(data.qrDataUrl);
      setSecret(data.secret);
      setStep("setup");
    } else {
      showError("Einrichtung fehlgeschlagen.", data.error);
    }
  };

  const activate = async () => {
    if (totpCode.replace(/\s/g, "").length < 6) {
      return toast("Bitte 6-stelligen Code eingeben.", "error");
    }
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/security/2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify", code: totpCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Aktivierung fehlgeschlagen");
        setBackupCodes(data.backupCodes ?? []);
        setEnabled(true);
        setStep("enabled");
        toast(ADMIN_MSG.twoFaEnabled);
        await load();
      })(),
    );
  };

  const disable = async () => {
    if (!disablePassword) return toast("Passwort erforderlich.", "error");
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/security/2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "disable", password: disablePassword, code: disableCode || undefined }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Deaktivierung fehlgeschlagen");
        setEnabled(false);
        setStep("idle");
        setDisablePassword("");
        setDisableCode("");
        toast(ADMIN_MSG.twoFaDisabled);
        await load();
      })(),
    );
  };

  const regenerateBackup = async () => {
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/security/2fa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "regenerate_backup", code: regenCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Fehler");
        setBackupCodes(data.backupCodes ?? []);
        toast("Neue Backup-Codes erstellt");
        await load();
      })(),
    );
  };

  const copyBackupCodes = () => {
    void navigator.clipboard.writeText(backupCodes.join("\n"));
    toast("Backup-Codes kopiert");
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([`Panda-Bande CMS — 2FA Backup-Codes\n\n${backupCodes.join("\n")}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "panda-bande-2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page} />

      <SecuritySubNav />

      <AdminCard title="Status">
        <div className="flex items-center gap-3">
          <Shield className={`h-8 w-8 ${enabled ? "text-primary" : "text-text-muted"}`} />
          <div>
            <p className="font-semibold text-text-primary">{enabled ? "2FA ist aktiv" : "2FA ist nicht aktiv"}</p>
            {enabled ? (
              <p className="text-sm text-text-muted">Verbleibende Backup-Codes: {backupRemaining}</p>
            ) : (
              <p className="text-sm text-text-muted">Nach dem Passwort-Login wird kein zusätzlicher Code abgefragt.</p>
            )}
          </div>
        </div>
      </AdminCard>

      {!enabled && step === "idle" ? (
        <AdminCard title="2FA einrichten">
          <p className="mb-4 text-sm text-text-secondary">
            1. Klicke auf „2FA einrichten“<br />
            2. Scanne den QR-Code mit deiner Authenticator-App<br />
            3. Gib den 6-stelligen Code ein und aktiviere 2FA<br />
            4. Speichere die Backup-Codes sicher ab
          </p>
          <AdminButton variant="primary" onClick={() => void setup()}>2FA einrichten</AdminButton>
        </AdminCard>
      ) : null}

      {step === "setup" ? (
        <AdminCard title="Authenticator verbinden">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="2FA QR Code" className="mx-auto h-52 w-52 rounded-xl border border-border" />
              <p className="mt-3 text-xs text-text-muted">QR-Code mit Authenticator-App scannen</p>
            </div>
            <div className="space-y-4">
              <AdminFormField label="Secret (Text-Fallback)" hint="Manuell eingeben, falls QR-Scan nicht funktioniert.">
                <input className="admin-input font-mono text-sm" readOnly value={secret} onFocus={(e) => e.target.select()} />
              </AdminFormField>
              <AdminFormField label="6-stelliger Code" required hint="Code aus der Authenticator-App.">
                <input
                  className="admin-input text-lg tracking-[0.3em]"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  placeholder="000000"
                />
              </AdminFormField>
              <AdminButton variant="primary" onClick={() => void activate()}>2FA aktivieren</AdminButton>
            </div>
          </div>
        </AdminCard>
      ) : null}

      {backupCodes.length > 0 ? (
        <AdminCard title="Backup-Codes — jetzt sichern!">
          <p className="mb-3 text-sm text-accent-heart">
            Diese Codes werden nur einmal angezeigt. Bewahre sie sicher auf — jeder Code ist einmal verwendbar.
          </p>
          <ul className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-bg-secondary p-4 font-mono text-sm md:grid-cols-5">
            {backupCodes.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <AdminButton variant="secondary" icon={<Copy className="h-4 w-4" />} onClick={copyBackupCodes}>Kopieren</AdminButton>
            <AdminButton variant="secondary" icon={<Download className="h-4 w-4" />} onClick={downloadBackupCodes}>Herunterladen</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {enabled ? (
        <>
          <AdminCard title="Backup-Codes neu generieren">
            <AdminFormField label="Aktueller 2FA-Code" required>
              <input className="admin-input" value={regenCode} onChange={(e) => setRegenCode(e.target.value)} />
            </AdminFormField>
            <div className="mt-4">
              <AdminButton variant="secondary" onClick={() => void regenerateBackup()}>Neue Codes generieren</AdminButton>
            </div>
          </AdminCard>

          <AdminCard title="2FA deaktivieren">
            <p className="mb-4 text-sm text-text-muted">Zur Sicherheit ist dein Passwort erforderlich.</p>
            <div className="grid gap-4 md:grid-cols-2">
              <AdminFormField label="Passwort" required>
                <input className="admin-input" type="password" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} />
              </AdminFormField>
              <AdminFormField label="2FA-Code" hint="Falls 2FA aktiv ist, zusätzlich eingeben.">
                <input className="admin-input" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} />
              </AdminFormField>
            </div>
            <div className="mt-4">
              <AdminButton variant="danger" onClick={() => void disable()}>2FA deaktivieren</AdminButton>
            </div>
          </AdminCard>
        </>
      ) : null}
    </div>
  );
}
