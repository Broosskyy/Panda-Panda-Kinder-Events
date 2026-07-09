"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Copy } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import {
  DEFAULT_INVITE_PASSWORD_POLICY,
  getPasswordRuleStatusesWithConfirm,
  isPasswordValid,
  validatePasswordRules,
} from "@/lib/auth/password-rules";
import type { PasswordPolicy } from "@/lib/auth/types";
import { ADMIN_HOME_PATH } from "@/lib/admin/routes";

type Step = "loading" | "invalid" | "password" | "2fa" | "done";

interface InvitePreview {
  email: string;
  displayName: string;
  roleLabel: string;
  expiresAt: string;
}

export function AdminInviteAcceptForm({ token }: { token: string }) {
  const [step, setStep] = useState<Step>("loading");
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy>(DEFAULT_INVITE_PASSWORD_POLICY);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pendingSecret, setPendingSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const passwordRules = useMemo(
    () => getPasswordRuleStatusesWithConfirm(password, confirm, passwordPolicy),
    [password, confirm, passwordPolicy],
  );

  const passwordValid = useMemo(
    () => isPasswordValid(password, confirm, passwordPolicy),
    [password, confirm, passwordPolicy],
  );

  useEffect(() => {
    fetch(`/api/admin/invites/validate?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setPreview({
            email: data.email,
            displayName: data.displayName,
            roleLabel: data.roleLabel,
            expiresAt: data.expiresAt,
          });
          if (data.passwordPolicy) {
            setPasswordPolicy(data.passwordPolicy as PasswordPolicy);
          }
          setStep("password");
        } else {
          setStep("invalid");
        }
      })
      .catch(() => setStep("invalid"));
  }, [token]);

  const copySecret = async () => {
    if (!pendingSecret) return;
    try {
      await navigator.clipboard.writeText(pendingSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Schlüssel konnte nicht kopiert werden. Bitte manuell markieren und kopieren.");
    }
  };

  const goBackToPassword = () => {
    setStep("password");
    setError("");
    setSuccess("");
    setTotpCode("");
  };

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validatePasswordRules(password, passwordPolicy);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setup", token }),
    });
    const data = await res.json();
    if (res.ok) {
      setQrDataUrl(data.qrDataUrl);
      setPendingSecret(data.secret);
      setStep("2fa");
      setSuccess("QR-Code und manueller Schlüssel bereit. Bitte 2FA einrichten.");
    } else {
      setError(data.error ?? "Einrichtung fehlgeschlagen.");
    }
    setLoading(false);
  };

  const submit2fa = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const validationError = validatePasswordRules(password, passwordPolicy);
    if (validationError) {
      setError(validationError);
      setStep("password");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/admin/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, totpCode, pendingSecret }),
    });
    const data = (await res.json()) as { error?: string; field?: string; backupCodes?: string[] };
    if (res.ok) {
      setBackupCodes(data.backupCodes ?? []);
      setStep("done");
    } else if (data.field === "password") {
      setError(data.error ?? "Passwort entspricht nicht den Anforderungen.");
      setStep("password");
    } else {
      setError(data.error ?? "Ungültiger 2FA-Code. Bitte Authenticator-App prüfen und erneut eingeben.");
    }
    setLoading(false);
  };

  if (step === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary">
        <p className="text-text-muted">Einladung wird geprüft…</p>
      </div>
    );
  }

  if (step === "invalid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-8 text-center shadow-lg">
          <h1 className="font-heading text-xl font-bold">Einladung ungültig</h1>
          <p className="mt-3 text-sm text-text-muted">
            Der Link ist abgelaufen, wurde bereits verwendet oder widerrufen.
          </p>
          <Link href={ADMIN_HOME_PATH} className="mt-4 inline-block text-primary underline">
            Zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-bg-card p-8 shadow-lg">
          <h1 className="font-heading text-xl font-bold text-center">Zugang eingerichtet</h1>
          <p className="text-sm text-text-muted text-center">
            Ihr Konto ist aktiv. Speichern Sie die Backup-Codes an einem sicheren Ort.
          </p>
          {backupCodes.length > 0 ? (
            <div className="rounded-xl bg-bg-secondary p-4 font-mono text-sm">
              {backupCodes.map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>
          ) : null}
          <Link href={ADMIN_HOME_PATH} className="block w-full min-h-12 rounded-full bg-primary text-center leading-[3rem] font-medium text-white">
            Zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <form
        onSubmit={step === "password" ? submitPassword : submit2fa}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-bg-card p-8 shadow-lg"
      >
        <div className="text-center">
          <Logo context="login" linked={false} className="mx-auto justify-center" />
          <h1 className="font-heading mt-5 text-2xl font-bold">Zugang einrichten</h1>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-text-muted">
            Schritt {step === "password" ? "1" : "2"} von 2 — {step === "password" ? "Passwort" : "2FA"}
          </p>
          {preview ? (
            <div className="mt-3 text-sm text-text-muted">
              <p>{preview.displayName}</p>
              <p>{preview.email}</p>
              <p className="mt-1 font-medium text-primary">{preview.roleLabel}</p>
            </div>
          ) : null}
        </div>

        {step === "password" ? (
          <>
            <div>
              <label className="mb-2 block text-sm font-medium">Passwort</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4"
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Passwort bestätigen</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4"
                required
                autoComplete="new-password"
              />
            </div>
            <ul className="space-y-1 rounded-xl border border-border bg-bg-secondary p-3 text-sm">
              {passwordRules.map((rule) => (
                <li
                  key={rule.id}
                  className={rule.ok ? "text-[#2d5a3a]" : "text-text-muted"}
                >
                  {rule.ok ? "✓" : "○"} {rule.label}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={goBackToPassword}
              className="text-sm text-primary underline"
            >
              ← Zurück zum Passwort ändern
            </button>
            <p className="text-sm text-text-muted">
              Scannen Sie den QR-Code mit Ihrer Authenticator-App oder nutzen Sie den manuellen Schlüssel unten.
            </p>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="2FA QR-Code" className="mx-auto h-48 w-48 rounded-lg border border-border" />
            ) : null}

            <div className="space-y-2 rounded-xl border border-border bg-bg-secondary p-4">
              <label className="block text-sm font-medium text-text-primary">Manueller Einrichtungsschlüssel</label>
              <input
                type="text"
                readOnly
                value={pendingSecret}
                onFocus={(e) => e.target.select()}
                className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 font-mono text-sm tracking-wide text-text-primary"
                aria-label="Manueller 2FA-Schlüssel"
              />
              <button
                type="button"
                onClick={() => void copySecret()}
                disabled={!pendingSecret}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-bg-card px-4 text-sm font-medium text-text-primary hover:bg-bg-secondary disabled:opacity-50"
              >
                <Copy className="h-4 w-4" aria-hidden />
                {copied ? "Schlüssel kopiert" : "Schlüssel kopieren"}
              </button>
              <p className="text-xs text-text-muted">
                Falls der QR-Code nicht funktioniert, füge diesen Schlüssel manuell in deiner Authenticator-App hinzu.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">6-stelliger Sicherheitscode</label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4 tracking-widest"
                placeholder="000000"
                required
                minLength={6}
                maxLength={8}
              />
            </div>
          </>
        )}

        {error ? <p className="text-sm text-accent-heart" role="alert">{error}</p> : null}
        {success ? <p className="text-sm text-[#2d5a3a]" role="status">{success}</p> : null}
        {step === "password" ? (
          <button
            type="submit"
            disabled={loading || !passwordValid}
            className="w-full min-h-12 rounded-full bg-primary font-medium text-white disabled:opacity-60"
          >
            {loading ? "Bitte warten…" : "Weiter zu 2FA"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-12 rounded-full bg-primary font-medium text-white disabled:opacity-60"
          >
            {loading ? "Bitte warten…" : "Account aktivieren"}
          </button>
        )}
      </form>
    </div>
  );
}
