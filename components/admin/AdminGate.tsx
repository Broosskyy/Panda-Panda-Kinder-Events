"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminUiProvider } from "./AdminUiProvider";
import { AdminNotificationsProvider } from "./AdminNotificationsProvider";
import { AdminLoginForm } from "./AdminLoginForm";

const PUBLIC_ADMIN_PATHS = ["/admin/passwort-reset"];

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ADMIN_PATHS.some((p) => pathname?.startsWith(p));
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(!isPublicRoute);

  useEffect(() => {
    if (isPublicRoute) return;
    fetch("/api/admin/login")
      .then((res) => res.json())
      .then((data) => setAuthenticated(Boolean(data.authenticated)))
      .finally(() => setChecking(false));
  }, [isPublicRoute]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

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
      <AdminNotificationsProvider>
        <div className="admin-shell flex min-h-[100dvh] flex-col md:flex-row" data-admin-theme="light">
          <AdminSidebar />
          <main className="admin-main flex-1 overflow-x-hidden">{children}</main>
          <AdminQuickActions />
        </div>
      </AdminNotificationsProvider>
    </AdminUiProvider>
  );
}
