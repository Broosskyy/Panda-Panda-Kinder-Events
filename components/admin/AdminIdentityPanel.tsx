"use client";

import { User } from "lucide-react";
import { roleDisplayLabel } from "@/lib/admin/roles";
import type { AdminRoleSlug } from "@/lib/auth/types";

export interface AdminIdentity {
  userId: string;
  displayName: string;
  email: string;
  roleSlug: AdminRoleSlug;
  roleLabel: string;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

export function AdminIdentitySkeleton() {
  return (
    <div className="admin-identity-panel admin-identity-panel-compact animate-pulse" aria-hidden>
      <div className="admin-identity-avatar admin-identity-avatar-sm bg-border" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3.5 w-24 rounded bg-border" />
        <div className="h-3 w-32 rounded bg-border" />
      </div>
    </div>
  );
}

export function AdminIdentityPanel({
  identity,
  loading = false,
  compact = false,
}: {
  identity: AdminIdentity | null;
  loading?: boolean;
  compact?: boolean;
}) {
  if (loading) return <AdminIdentitySkeleton />;
  if (!identity?.userId) return null;

  const roleLabel = identity.roleLabel || roleDisplayLabel(identity.roleSlug);

  return (
    <div
      className={`admin-identity-panel ${compact ? "admin-identity-panel-compact" : ""}`}
      aria-label="Angemeldeter Benutzer"
    >
      <div className={`admin-identity-avatar ${compact ? "admin-identity-avatar-sm" : ""}`} aria-hidden>
        {identity.displayName ? initials(identity.displayName) : <User className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">{identity.displayName}</p>
        <p className="truncate text-xs text-text-muted" title={identity.email}>
          {identity.email}
        </p>
        <p className="mt-0.5 text-[11px] font-medium text-primary">{roleLabel}</p>
        <details className="admin-identity-id-details">
          <summary className="cursor-pointer text-[10px] text-text-muted">ID anzeigen</summary>
          <p className="mt-0.5 truncate font-mono text-[10px] text-text-muted" title={identity.userId}>
            {identity.userId}
          </p>
        </details>
      </div>
    </div>
  );
}
