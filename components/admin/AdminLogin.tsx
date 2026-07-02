"use client";

import { useEffect, useState } from "react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/bookings")
      .then((res) => {
        if (res.ok) setAuthenticated(true);
      })
      .finally(() => setChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setAuthenticated(true);
    } else {
      const data = await res.json();
      setError(data.error ?? "Anmeldung fehlgeschlagen.");
    }
    setLoading(false);
  };

  if (checking) {
    return <p className="text-text-secondary">Prüfe Anmeldung...</p>;
  }

  if (authenticated) {
    return <AdminDashboard />;
  }

  return (
    <form onSubmit={handleLogin} className="mx-auto max-w-sm space-y-4">
      <div>
        <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
          Admin-Passwort
        </label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-border px-4 py-3"
          required
        />
      </div>
      {error && <p className="text-sm text-accent-heart">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white"
      >
        {loading ? "Anmelden..." : "Anmelden"}
      </button>
    </form>
  );
}
