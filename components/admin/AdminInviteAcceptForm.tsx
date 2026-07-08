"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

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
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pendingSecret, setPendingSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
          setStep("password");
        } else {
          setStep("invalid");
        }
      })
      .catch(() => setStep("invalid"));
  }, [token]);

  const submitPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    setLoading(true);
    setError("");
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
    } else {
      setError(data.error ?? "Einrichtung fehlgeschlagen.");
    }
    setLoading(false);
  };

  const submit2fa = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/invites/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password, totpCode, pendingSecret }),
    });
    const data = await res.json();
    if (res.ok) {
      setBackupCodes(data.backupCodes ?? []);
      setStep("done");
    } else {
      setError(data.error ?? "2FA-Aktivierung fehlgeschlagen.");
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
          <Link href="/admin" className="mt-4 inline-block text-primary underline">
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
          <Link href="/admin" className="block w-full min-h-12 rounded-full bg-primary text-center leading-[3rem] font-medium text-white">
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
                minLength={8}
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
                minLength={8}
              />
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-text-muted">
              Scannen Sie den QR-Code mit Ihrer Authenticator-App und geben Sie den 6-stelligen Code ein.
            </p>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="2FA QR-Code" className="mx-auto h-48 w-48 rounded-lg border border-border" />
            ) : null}
            <div>
              <label className="mb-2 block text-sm font-medium">Sicherheitscode</label>
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full min-h-12 rounded-xl border border-border px-4 tracking-widest"
                required
              />
            </div>
          </>
        )}

        {error ? <p className="text-sm text-accent-heart">{error}</p> : null}
        <button type="submit" disabled={loading} className="w-full min-h-12 rounded-full bg-primary font-medium text-white">
          {loading ? "Bitte warten…" : step === "password" ? "Weiter zu 2FA" : "Account aktivieren"}
        </button>
      </form>
    </div>
  );
}
