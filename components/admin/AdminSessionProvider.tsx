"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AdminIdentity } from "@/components/admin/AdminIdentityPanel";
import { roleDisplayLabel } from "@/lib/admin/roles";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteModulesSettings } from "@/lib/cms/types";
import type { AdminRoleSlug } from "@/lib/auth/types";

export type AdminSessionStatus = "loading" | "ready" | "error";

interface AdminSessionContextValue {
  status: AdminSessionStatus;
  identity: AdminIdentity | null;
  permissions: string[];
  modules: SiteModulesSettings;
  refresh: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

function mapLoginToIdentity(data: Record<string, unknown>): AdminIdentity | null {
  if (!data.authenticated || !data.userId) return null;

  const displayName = String(data.displayName ?? (data.identity as { displayName?: string } | undefined)?.displayName ?? "").trim();
  const email = String(data.email ?? (data.identity as { email?: string } | undefined)?.email ?? "").trim();
  const roleSlug = (data.roleSlug ?? (data.identity as { roleSlug?: string } | undefined)?.roleSlug ?? "readonly") as AdminRoleSlug;
  const roleLabel = String(
    data.roleLabel ?? (data.identity as { roleLabel?: string } | undefined)?.roleLabel ?? roleDisplayLabel(roleSlug),
  ).trim();

  if (!displayName || !email) return null;

  return {
    userId: String(data.userId),
    displayName,
    email,
    roleSlug,
    roleLabel,
  };
}

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminSessionStatus>("loading");
  const [identity, setIdentity] = useState<AdminIdentity | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [modules, setModules] = useState<SiteModulesSettings>(DEFAULT_SITE_SETTINGS.modules);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/login");
      const data = await res.json();
      const mapped = mapLoginToIdentity(data as Record<string, unknown>);

      if (!mapped) {
        setIdentity(null);
        setPermissions([]);
        setModules(DEFAULT_SITE_SETTINGS.modules);
        setStatus("error");
        return;
      }

      setIdentity(mapped);
      setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
      if (data.modules) setModules(data.modules as SiteModulesSettings);
      setStatus("ready");
    } catch {
      setIdentity(null);
      setPermissions([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminSessionContext.Provider value={{ status, identity, permissions, modules, refresh: load }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession must be used within AdminSessionProvider");
  return ctx;
}

export function useOptionalAdminSession() {
  return useContext(AdminSessionContext);
}
