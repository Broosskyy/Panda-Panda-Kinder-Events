"use client";

import { useState, type FormEvent } from "react";
import { Logo } from "@/components/ui/Logo";

export function AdminBootstrapWizard({ onComplete }: { onComplete: () => void }) {
  const [username, setUsername] = useState("manuel");
  const [email, setEmail] = useState("manuel.bauch0705@gmail.com");
  const [displayName, setDisplayName] = useState("Manuel Bauch");
  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, displayName, adminPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      onComplete();
    } else {
      setError(data.error ?? "Einrichtung fehlgeschlagen.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border bg-bg-card p-8 shadow-lg"
      >
        <div className="text-center">
          <Logo context="login" linked={false} className="mx-auto justify-center" />
          <h1 className="font-heading mt-5 text-2xl font-bold text-text-primary">Erster Admin-Benutzer</h1>
          <p className="mt-2 text-sm text-text-muted">
            Noch kein Benutzer in der Datenbank. Legen Sie jetzt den ersten Super Admin an.
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Anzeigename</label>
          <input className="admin-input w-full" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">E-Mail</label>
          <input className="admin-input w-full" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Benutzername</label>
          <input className="admin-input w-full" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Passwort (neuer Admin)</label>
          <input className="admin-input w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Server-Setup-Passwort (ADMIN_PASSWORD)</label>
          <input className="admin-input w-full" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
          <p className="mt-1 text-xs text-text-muted">Einmalige Bestätigung für die Ersteinrichtung.</p>
        </div>

        {error ? <p className="text-sm text-accent-heart">{error}</p> : null}

        <button type="submit" disabled={loading} className="w-full min-h-12 rounded-full bg-primary font-medium text-white">
          {loading ? "Wird angelegt…" : "Super Admin anlegen"}
        </button>
      </form>
    </div>
  );
}
