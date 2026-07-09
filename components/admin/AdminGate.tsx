"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminQuickActions } from "./AdminQuickActions";
import { AdminUiProvider } from "./AdminUiProvider";
import { AdminActionFeedbackProvider } from "./AdminActionFeedbackProvider";
import { AdminSessionProvider, type AdminLoginSnapshot } from "./AdminSessionProvider";
import { AdminNotificationsProvider } from "./AdminNotificationsProvider";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminBootstrapWizard } from "./AdminBootstrapWizard";
import { AdminPwaProvider } from "./AdminPwaProvider";
import { AdminOnboardingProvider } from "./AdminOnboardingProvider";
import { ADMIN_PUBLIC_PAGE_PREFIXES } from "@/lib/admin/routes";

const PUBLIC_ADMIN_PATHS = [...ADMIN_PUBLIC_PAGE_PREFIXES];

type GateState = "checking" | "bootstrap" | "login" | "authenticated";

export function AdminGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = PUBLIC_ADMIN_PATHS.some((p) => pathname?.startsWith(p));
  const [gateState, setGateState] = useState<GateState>(isPublicRoute ? "authenticated" : "checking");
  const [loginSnapshot, setLoginSnapshot] = useState<AdminLoginSnapshot | null>(null);

  useEffect(() => {
    if (isPublicRoute) return;
    fetch("/api/admin/login")
      .then((res) => res.json())
      .then((data: AdminLoginSnapshot & { needsBootstrap?: boolean; bootstrap?: { allowed?: boolean } }) => {
        setLoginSnapshot(data);
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
    const handleLoginSuccess = () => {
      fetch("/api/admin/login")
        .then((res) => res.json())
        .then((data: AdminLoginSnapshot) => {
          setLoginSnapshot(data);
          setGateState("authenticated");
        })
        .catch(() => setGateState("authenticated"));
    };

    return <AdminLoginForm onSuccess={handleLoginSuccess} />;
  }

  return (
    <AdminSessionProvider initialLoginData={loginSnapshot}>
      <AdminOnboardingProvider initialCompleted={Boolean(loginSnapshot?.onboardingCompleted)}>
        <AdminUiProvider>
          <AdminActionFeedbackProvider>
            <AdminNotificationsProvider>
              <AdminPwaProvider>
                <div className="admin-shell flex min-h-[100dvh] flex-col md:flex-row" data-admin-theme="light">
                  <AdminSidebar />
                  <main className="admin-main flex-1 overflow-x-hidden">{children}</main>
                  <AdminQuickActions />
                </div>
              </AdminPwaProvider>
            </AdminNotificationsProvider>
          </AdminActionFeedbackProvider>
        </AdminUiProvider>
      </AdminOnboardingProvider>
    </AdminSessionProvider>
  );
}
