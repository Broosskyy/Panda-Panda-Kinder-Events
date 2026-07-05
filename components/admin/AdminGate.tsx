"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminUiProvider } from "./AdminUiProvider";
import { AdminLoginForm } from "./AdminLoginForm";

export function AdminGate({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((res) => setAuthenticated(res.ok))
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary">
        <p className="text-text-muted">Prüfe Anmeldung...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLoginForm onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <AdminUiProvider>
      <div className="admin-shell flex min-h-screen flex-col md:flex-row" data-admin-theme="light">
        <AdminSidebar />
        <main className="admin-main flex-1 overflow-x-hidden">{children}</main>
      </div>
    </AdminUiProvider>
  );
}
