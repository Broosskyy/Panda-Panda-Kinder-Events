"use client";

import { useState, type FormEvent } from "react";

export function AdminLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error ?? "Anmeldung fehlgeschlagen.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5 rounded-2xl border border-border bg-bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-text-primary">Panda-Bande CMS</h1>
          <p className="mt-2 text-sm text-text-muted">Admin-Anmeldung</p>
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
            Passwort
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full min-h-12 rounded-xl border border-border px-4"
            required
          />
        </div>
        {error && <p className="text-sm text-accent-heart">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-12 rounded-full bg-primary font-medium text-white"
        >
          {loading ? "Anmelden..." : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
