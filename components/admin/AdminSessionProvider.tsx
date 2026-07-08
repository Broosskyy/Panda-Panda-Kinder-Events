"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { AdminIdentity } from "@/components/admin/AdminIdentityPanel";
import { roleDisplayLabel } from "@/lib/admin/roles";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteModulesSettings } from "@/lib/cms/types";
import type { AdminRoleSlug } from "@/lib/auth/types";

export type AdminSessionStatus = "loading" | "ready" | "error";

export interface AdminLoginSnapshot {
  authenticated?: boolean;
  userId?: string;
  displayName?: string;
  email?: string;
  roleSlug?: AdminRoleSlug;
  roleLabel?: string;
  permissions?: string[];
  modules?: SiteModulesSettings;
  isSuperAdmin?: boolean;
  identity?: Partial<AdminIdentity>;
}

interface AdminSessionContextValue {
  status: AdminSessionStatus;
  identity: AdminIdentity | null;
  permissions: string[];
  modules: SiteModulesSettings;
  isSuperAdmin: boolean;
  refresh: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextValue | null>(null);

function mapLoginToIdentity(data: AdminLoginSnapshot): AdminIdentity | null {
  if (!data.authenticated || !data.userId) return null;

  const displayName = String(data.displayName ?? data.identity?.displayName ?? "").trim();
  const email = String(data.email ?? data.identity?.email ?? "").trim();
  const roleSlug = (data.roleSlug ?? data.identity?.roleSlug ?? "readonly") as AdminRoleSlug;
  const roleLabel = String(data.roleLabel ?? data.identity?.roleLabel ?? roleDisplayLabel(roleSlug)).trim();

  if (!displayName || !email) return null;

  return {
    userId: String(data.userId),
    displayName,
    email,
    roleSlug,
    roleLabel,
  };
}

function applyLoginSnapshot(
  data: AdminLoginSnapshot,
  setIdentity: (v: AdminIdentity | null) => void,
  setPermissions: (v: string[]) => void,
  setModules: (v: SiteModulesSettings) => void,
  setIsSuperAdmin: (v: boolean) => void,
  setStatus: (v: AdminSessionStatus) => void,
) {
  const mapped = mapLoginToIdentity(data);

  if (!mapped) {
    setIdentity(null);
    setPermissions([]);
    setModules(DEFAULT_SITE_SETTINGS.modules);
    setIsSuperAdmin(false);
    setStatus("error");
    return;
  }

  setIdentity(mapped);
  setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
  if (data.modules) setModules(data.modules);
  setIsSuperAdmin(Boolean(data.isSuperAdmin));
  setStatus("ready");
}

export function AdminSessionProvider({
  children,
  initialLoginData,
}: {
  children: ReactNode;
  initialLoginData?: AdminLoginSnapshot | null;
}) {
  const [status, setStatus] = useState<AdminSessionStatus>(
    initialLoginData?.authenticated ? "ready" : "loading",
  );
  const [identity, setIdentity] = useState<AdminIdentity | null>(() =>
    initialLoginData?.authenticated ? mapLoginToIdentity(initialLoginData) : null,
  );
  const [permissions, setPermissions] = useState<string[]>(
    initialLoginData?.authenticated && Array.isArray(initialLoginData.permissions)
      ? initialLoginData.permissions
      : [],
  );
  const [modules, setModules] = useState<SiteModulesSettings>(
    initialLoginData?.modules ?? DEFAULT_SITE_SETTINGS.modules,
  );
  const [isSuperAdmin, setIsSuperAdmin] = useState(Boolean(initialLoginData?.isSuperAdmin));

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/login");
      const data = (await res.json()) as AdminLoginSnapshot;
      applyLoginSnapshot(data, setIdentity, setPermissions, setModules, setIsSuperAdmin, setStatus);
    } catch {
      setIdentity(null);
      setPermissions([]);
      setIsSuperAdmin(false);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (initialLoginData?.authenticated && mapLoginToIdentity(initialLoginData)) return;
    void load();
  }, [initialLoginData, load]);

  return (
    <AdminSessionContext.Provider
      value={{ status, identity, permissions, modules, isSuperAdmin, refresh: load }}
    >
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
