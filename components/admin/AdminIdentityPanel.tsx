"use client";

import { User } from "lucide-react";
import { roleDisplayLabel } from "@/lib/admin/roles";
import type { AdminRoleSlug } from "@/lib/auth/types";

export interface AdminIdentity {
  userId: string | null;
  displayName: string;
  email: string | null;
  roleSlug: AdminRoleSlug | "legacy";
  roleLabel: string;
  isLegacy?: boolean;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function AdminIdentityPanel({ identity }: { identity: AdminIdentity | null }) {
  if (!identity) return null;

  const roleLabel = identity.roleLabel || roleDisplayLabel(identity.roleSlug);

  return (
    <div className="admin-identity-panel" aria-label="Angemeldeter Benutzer">
      <div className="admin-identity-avatar" aria-hidden>
        {identity.displayName ? initials(identity.displayName) : <User className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-text-primary">{identity.displayName}</p>
        {identity.email ? <p className="truncate text-xs text-text-muted">{identity.email}</p> : null}
        <p className="mt-1 text-xs font-medium text-primary">{roleLabel}</p>
        {identity.userId ? (
          <p className="mt-0.5 truncate font-mono text-[10px] text-text-muted" title={identity.userId}>
            ID: {identity.userId}
          </p>
        ) : identity.isLegacy ? (
          <p className="mt-0.5 text-[10px] text-amber-700">Legacy-Zugang (kein Benutzerprofil)</p>
        ) : null}
      </div>
    </div>
  );
}
