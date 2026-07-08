"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminUiProvider } from "./AdminUiProvider";
import { AdminSessionProvider } from "./AdminSessionProvider";
import { AdminNotificationsProvider } from "./AdminNotificationsProvider";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminBootstrapWizard } from "./AdminBootstrapWizard";
import { AdminPwaProvider } from "./AdminPwaProvider";
import { AdminOnboardingProvider } from "./AdminOnboardingProvider";

const PUBLIC_ADMIN_PATHS = ["/admin/passwort-reset"];

type GateState = "checking" | "bootstrap" | "login" | "authenticated";

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ADMIN_PATHS.some((p) => pathname?.startsWith(p));
  const [gateState, setGateState] = useState<GateState>(isPublicRoute ? "authenticated" : "checking");

  useEffect(() => {
    if (isPublicRoute) return;
    fetch("/api/admin/login")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setGateState("authenticated");
          return;
        }
        const bootstrapAllowed = data.bootstrap?.allowed === true;
        if (bootstrapAllowed && data.needsBootstrap === true) {
          setGateState("bootstrap");
          return;
        }
        setGateState("login");
      })
      .catch(() => setGateState("login"));
  }, [isPublicRoute]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (gateState === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-secondary">
        <p className="text-text-muted">Prüfe Anmeldung...</p>
      </div>
    );
  }

  if (gateState === "bootstrap") {
    return <AdminBootstrapWizard onComplete={() => setGateState("login")} />;
  }

  if (gateState === "login") {
    return <AdminLoginForm onSuccess={() => setGateState("authenticated")} />;
  }

  return (
    <AdminSessionProvider>
      <AdminOnboardingProvider>
        <AdminUiProvider>
          <AdminNotificationsProvider>
            <AdminPwaProvider>
              <div className="admin-shell flex min-h-[100dvh] flex-col md:flex-row" data-admin-theme="light">
                <AdminSidebar />
                <main className="admin-main flex-1 overflow-x-hidden">{children}</main>
                <AdminQuickActions />
              </div>
            </AdminPwaProvider>
          </AdminNotificationsProvider>
        </AdminUiProvider>
      </AdminOnboardingProvider>
    </AdminSessionProvider>
  );
}
