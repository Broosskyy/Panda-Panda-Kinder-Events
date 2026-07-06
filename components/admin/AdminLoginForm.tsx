"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

type LoginStep = "credentials" | "2fa";

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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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
      setStep("2fa");
    } else if (res.ok) {
      onSuccess();
    } else {
      setError(data.error ?? "Anmeldung fehlgeschlagen.");
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
        rememberMe,
        trustDevice,
        totpCode: useBackup ? undefined : totpCode,
        backupCode: useBackup ? backupCode : undefined,
      }),
    });
    const data = await res.json();

    if (res.ok) {
      onSuccess();
    } else {
      setError(data.error ?? "2FA fehlgeschlagen.");
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
      setError(data.error ?? "Anfrage fehlgeschlagen.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <form
        onSubmit={step === "credentials" ? submitCredentials : submit2fa}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-bg-card p-8 shadow-lg"
      >
        <div className="text-center">
          <Logo size="md" linked={false} className="mx-auto justify-center" />
          <h1 className="font-heading mt-5 text-2xl font-bold text-text-primary">Panda-Bande CMS</h1>
          <p className="mt-2 text-sm text-text-muted">
            {step === "credentials" ? "Admin-Anmeldung" : "Zwei-Faktor-Authentifizierung"}
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
              <p className="text-sm text-primary">Falls ein Konto existiert, wurde eine E-Mail versendet.</p>
            ) : null}
          </>
        ) : (
          <>
            {!useBackup ? (
              <div>
                <label htmlFor="totp-code" className="mb-2 block text-sm font-medium">
                  Authenticator-Code
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
          {loading ? "Anmelden..." : step === "credentials" ? "Anmelden" : "Bestätigen"}
        </button>
        <p className="text-center text-xs text-text-muted">
          Legacy-Modus: nur Passwort, wenn noch kein Benutzer angelegt ist.
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
          <Link href="/admin" className="mt-4 inline-block text-primary underline">
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
