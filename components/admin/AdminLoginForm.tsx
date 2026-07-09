"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ADMIN_HOME_PATH } from "@/lib/admin/routes";

type LoginStep = "credentials" | "password-change" | "2fa" | "2fa-setup";

function friendlyLoginError(message: string): string {
  const map: Record<string, string> = {
    "Ungültiges Passwort.": "Das Passwort ist nicht korrekt. Bitte erneut versuchen.",
    "Ungültige Anmeldedaten.": "Benutzername oder Passwort ist nicht korrekt.",
    "Ungültiger 2FA-Code.": "Der Sicherheitscode ist nicht korrekt. Bitte erneut eingeben.",
    "2FA-Sitzung abgelaufen. Bitte erneut anmelden.": "Die Anmeldung ist abgelaufen. Bitte von vorne starten.",
    "Zu viele Loginversuche. Bitte später erneut versuchen.":
      "Zu viele Versuche. Bitte einige Minuten warten und es dann erneut versuchen.",
    "Admin ist nicht konfiguriert.": "Der Zugang ist noch nicht eingerichtet. Bitte den technischen Ansprechpartner kontaktieren.",
  };
  return map[message] ?? message ?? "Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.";
}

export function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [step, setStep] = useState<LoginStep>("credentials");
  const [pendingToken, setPendingToken] = useState("");
  const [pendingUserId, setPendingUserId] = useState("");
  const [rememberMeState, setRememberMeState] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const submitCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password, rememberMe }),
    });
    const data = await res.json();

    if (res.ok && data.requires2fa) {
      setPendingToken(data.pendingToken);
      setPendingUserId(data.userId);
      setRememberMeState(rememberMe);
      setStep("2fa");
    } else if (res.ok && data.requiresPasswordChange) {
      setPendingToken(data.pendingToken);
      setPendingUserId(data.userId);
      setRememberMeState(rememberMe);
      setStep("password-change");
    } else if (res.ok && data.requires2faSetup) {
      setPendingToken(data.pendingToken);
      setPendingUserId(data.userId);
      setRememberMeState(rememberMe);
      const setupRes = await fetch("/api/admin/login/2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken: data.pendingToken, userId: data.userId, action: "setup" }),
      });
      const setupData = await setupRes.json();
      if (setupRes.ok) {
        setQrDataUrl(setupData.qrDataUrl);
        setStep("2fa-setup");
      } else {
        setError(friendlyLoginError(setupData.error ?? "2FA-Einrichtung fehlgeschlagen."));
      }
    } else if (res.ok) {
      onSuccess();
    } else {
      setError(friendlyLoginError(data.error ?? "Anmeldung fehlgeschlagen."));
    }
    setLoading(false);
  };

  const submitPasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "change_password",
        pendingToken,
        userId: pendingUserId,
        newPassword,
        rememberMe: rememberMeState,
      }),
    });
    const data = await res.json();
    if (res.ok && data.requires2fa) {
      setPendingToken(data.pendingToken);
      setStep("2fa");
    } else if (res.ok && data.requires2faSetup) {
      setPendingToken(data.pendingToken);
      const setupRes = await fetch("/api/admin/login/2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingToken: data.pendingToken, userId: pendingUserId, action: "setup" }),
      });
      const setupData = await setupRes.json();
      if (setupRes.ok) {
        setQrDataUrl(setupData.qrDataUrl);
        setStep("2fa-setup");
      } else {
        setError(friendlyLoginError(setupData.error ?? "2FA-Einrichtung fehlgeschlagen."));
      }
    } else if (res.ok) {
      onSuccess();
    } else {
      setError(friendlyLoginError(data.error ?? "Passwort konnte nicht geändert werden."));
    }
    setLoading(false);
  };

  const submit2faSetup = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login/2fa-setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pendingToken,
        userId: pendingUserId,
        action: "verify",
        code: totpCode,
        rememberMe: rememberMeState,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      onSuccess();
    } else {
      setError(friendlyLoginError(data.error ?? "2FA-Einrichtung fehlgeschlagen."));
    }
    setLoading(false);
  };

  const submit2fa = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pendingToken,
        userId: pendingUserId,
        rememberMe: rememberMeState,
        trustDevice,
        totpCode: useBackup ? undefined : totpCode,
        backupCode: useBackup ? backupCode : undefined,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      onSuccess();
    } else {
      setError(friendlyLoginError(data.error ?? "Der Sicherheitscode ist nicht korrekt."));
    }
    setLoading(false);
  };

  const requestReset = async () => {
    if (!identifier.includes("@")) {
      setError("Bitte E-Mail-Adresse für Passwort-Reset eingeben.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier }),
    });
    if (res.ok) setResetSent(true);
    else {
      const data = await res.json();
      setError(data.error ?? "Die Anfrage konnte nicht gesendet werden. Bitte später erneut versuchen.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <form
        onSubmit={
          step === "credentials"
            ? submitCredentials
            : step === "password-change"
              ? submitPasswordChange
              : step === "2fa-setup"
                ? submit2faSetup
                : submit2fa
        }
        className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-bg-card p-8 shadow-lg"
      >
        <div className="text-center">
          <Logo context="login" linked={false} className="mx-auto justify-center" />
          <h1 className="font-heading mt-5 text-2xl font-bold text-text-primary">Panda-Bande Verwaltung</h1>
          <p className="mt-2 text-sm text-text-muted">
            {step === "credentials"
              ? "Melde dich mit deinem Zugang an."
              : step === "password-change"
                ? "Bitte setze zuerst ein neues Passwort."
              : step === "2fa-setup"
                ? "2FA ist verpflichtend. Bitte jetzt einrichten."
                : "Gib deinen Sicherheitscode ein."}
          </p>
        </div>

        {step === "credentials" ? (
          <>
            <div>
              <label htmlFor="admin-identifier" className="mb-2 block text-sm font-medium">
                Benutzername oder E-Mail
              </label>
              <input
                id="admin-identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4"
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
                Passwort
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4"
                required
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Angemeldet bleiben
            </label>
            <button
              type="button"
              className="text-sm text-primary underline"
              onClick={() => void requestReset()}
              disabled={loading}
            >
              Passwort vergessen?
            </button>
            {resetSent ? (
              <p className="rounded-lg bg-[#4a7c59]/10 px-3 py-2 text-sm text-[#4a7c59]">
                ✓ Falls ein Konto existiert, wurde eine E-Mail zum Zurücksetzen gesendet.
              </p>
            ) : null}
          </>
        ) : step === "password-change" ? (
          <>
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium">
                Neues Passwort
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4"
                required
              />
            </div>
            <div>
              <label htmlFor="new-password-confirm" className="mb-2 block text-sm font-medium">
                Passwort bestätigen
              </label>
              <input
                id="new-password-confirm"
                type="password"
                autoComplete="new-password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4"
                required
              />
            </div>
          </>
        ) : step === "2fa-setup" ? (
          <>
            <p className="text-sm text-text-muted">
              Scannen Sie den QR-Code mit Ihrer Authenticator-App.
            </p>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="2FA QR-Code" className="mx-auto h-40 w-40 rounded-lg border border-border" />
            ) : null}
            <div>
              <label htmlFor="setup-totp-code" className="mb-2 block text-sm font-medium">
                Sicherheitscode (6 Ziffern)
              </label>
              <input
                id="setup-totp-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4 tracking-widest"
                required
              />
            </div>
          </>
        ) : (
          <>
            {!useBackup ? (
              <div>
                <label htmlFor="totp-code" className="mb-2 block text-sm font-medium">
                  Sicherheitscode (6 Ziffern)
                </label>
                <input
                  id="totp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="w-full min-h-12 rounded-xl border border-border px-4 tracking-widest"
                  required={!useBackup}
                />
              </div>
            ) : (
              <div>
                <label htmlFor="backup-code" className="mb-2 block text-sm font-medium">
                  Backup-Code
                </label>
                <input
                  id="backup-code"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  className="w-full min-h-12 rounded-xl border border-border px-4 uppercase"
                  required={useBackup}
                />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={trustDevice} onChange={(e) => setTrustDevice(e.target.checked)} />
              Diesem Gerät 30 Tage vertrauen
            </label>
            <button
              type="button"
              className="text-sm text-primary underline"
              onClick={() => setUseBackup(!useBackup)}
            >
              {useBackup ? "Authenticator-Code verwenden" : "Backup-Code verwenden"}
            </button>
            <button
              type="button"
              className="text-sm text-text-muted underline"
              onClick={() => setStep("credentials")}
            >
              Zurück
            </button>
          </>
        )}

        {error && <p className="text-sm text-accent-heart">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-12 rounded-full bg-primary font-medium text-white"
        >
          {loading ? "Anmelden..." : step === "credentials" ? "Anmelden" : step === "2fa-setup" ? "2FA aktivieren" : "Bestätigen"}
        </button>
        <p className="text-center text-xs text-text-muted">
          Probleme beim Anmelden? Nutze „Passwort vergessen?“ oder wende dich an deinen Ansprechpartner.
        </p>
      </form>
    </div>
  );
}

export function AdminPasswordResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (res.ok) setDone(true);
    else setError(data.error ?? "Zurücksetzen fehlgeschlagen.");
    setLoading(false);
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-bg-card p-8 text-center shadow-lg">
          <h1 className="font-heading text-xl font-bold">Passwort aktualisiert</h1>
          <Link href={ADMIN_HOME_PATH} className="mt-4 inline-block text-primary underline">
            Zur Anmeldung
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-bg-card p-8 shadow-lg">
        <h1 className="font-heading text-xl font-bold text-center">Neues Passwort</h1>
        <input
          type="password"
          placeholder="Neues Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-h-12 rounded-xl border border-border px-4"
          required
        />
        <input
          type="password"
          placeholder="Passwort bestätigen"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full min-h-12 rounded-xl border border-border px-4"
          required
        />
        {error ? <p className="text-sm text-accent-heart">{error}</p> : null}
        <button type="submit" disabled={loading} className="w-full min-h-12 rounded-full bg-primary text-white">
          {loading ? "Speichern..." : "Passwort speichern"}
        </button>
      </form>
    </div>
  );
}
