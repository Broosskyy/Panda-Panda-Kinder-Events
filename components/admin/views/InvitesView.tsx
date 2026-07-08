"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Mail, Plus, RefreshCw, Trash2, XCircle } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminUserManageDialog } from "@/components/admin/AdminUserManageDialog";
import { UsersSecurityTabs } from "@/components/admin/UsersSecurityTabs";
import { AdminActionMenu, AdminButton, AdminLoadingCard, AdminStatusBadge } from "@/components/admin/ui";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import type { AdminRoleSlug } from "@/lib/auth/types";

interface Role {
  id: string;
  slug: string;
  label: string;
}

interface Invitation {
  id: string;
  email: string;
  display_name: string;
  role_id: string;
  role_slug: AdminRoleSlug;
  role_label: string;
  invited_by_name: string | null;
  message: string | null;
  status: "pending" | "accepted" | "expired" | "revoked";
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<Invitation["status"], string> = {
  pending: "Ausstehend",
  accepted: "Angenommen",
  expired: "Abgelaufen",
  revoked: "Widerrufen",
};

const STATUS_VARIANT: Record<Invitation["status"], "success" | "warning" | "muted" | "default"> = {
  pending: "warning",
  accepted: "success",
  expired: "muted",
  revoked: "muted",
};

export function InvitesView() {
  const searchParams = useSearchParams();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [canInvite, setCanInvite] = useState(false);
  const [canCreateManually, setCanCreateManually] = useState(false);
  const [inviterRole, setInviterRole] = useState<AdminRoleSlug>("readonly");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast, withLoading, fromApi } = useAdminMessages();
  const page = adminPageHeaderProps("benutzer");

  const load = useCallback(async () => {
    setLoading(true);
    const [inviteRes, usersRes] = await Promise.all([
      fetch("/api/admin/invites"),
      fetch("/api/admin/users"),
    ]);
    const inviteData = await inviteRes.json();
    const usersData = await usersRes.json();

    if (inviteRes.ok) {
      setInvitations(inviteData.invitations ?? []);
      setCanInvite(Boolean(inviteData.meta?.canInvite));
      setInviterRole((inviteData.meta?.inviterRole ?? "readonly") as AdminRoleSlug);
    } else if (inviteRes.status === 403) {
      setCanInvite(false);
    } else {
      toast(inviteData.error ?? "Einladungen konnten nicht geladen werden.", "error");
    }

    if (usersRes.ok) {
      setRoles(usersData.roles ?? []);
      setCanCreateManually(Boolean(usersData.meta?.canCreateUsers));
      if (!inviteRes.ok && usersData.meta?.canInvite) {
        setCanInvite(true);
        setInviterRole((usersData.meta?.inviterRole ?? "readonly") as AdminRoleSlug);
      }
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (searchParams.get("invite") === "1" && canInvite) {
      setDialogOpen(true);
    }
  }, [searchParams, canInvite]);

  const patchInvite = async (id: string, action: "resend" | "revoke" | "copy_link") => {
    const res = await fetch("/api/admin/invites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    if (!res.ok) return fromApi(data, "Aktion fehlgeschlagen.");
    if (action === "copy_link" && data.inviteUrl) {
      await navigator.clipboard.writeText(data.inviteUrl);
      toast("Einladungslink kopiert.");
    } else {
      toast(
        action === "resend"
          ? "Einladung erneut gesendet."
          : action === "revoke"
            ? "Einladung widerrufen."
            : "Link erstellt.",
      );
    }
    await load();
  };

  const deleteInvite = async (id: string) => {
    const res = await fetch("/api/admin/invites", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) return fromApi(data, "Löschen fehlgeschlagen.");
    toast("Einladung gelöscht.");
    await load();
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("de-DE");
  const canManage = canInvite || canCreateManually;

  const inviteActions = (inv: Invitation) => (
    <AdminActionMenu
      primary={
        inv.status === "pending"
          ? {
              label: "Erneut senden",
              icon: <RefreshCw className="h-4 w-4" />,
              onClick: () => patchInvite(inv.id, "resend"),
            }
          : undefined
      }
      items={[
        {
          id: "copy",
          label: "Link kopieren",
          icon: <Copy className="h-4 w-4" />,
          onClick: () => patchInvite(inv.id, "copy_link"),
          hidden: inv.status === "accepted",
        },
        {
          id: "revoke",
          label: "Widerrufen",
          icon: <XCircle className="h-4 w-4" />,
          onClick: () => patchInvite(inv.id, "revoke"),
          hidden: inv.status !== "pending",
        },
      ]}
      dangerItems={[
        {
          id: "delete",
          label: "Löschen",
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => deleteInvite(inv.id),
        },
      ]}
    />
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page}>
        {canManage ? (
          <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
            Benutzer einladen
          </AdminButton>
        ) : null}
      </AdminPageHeader>

      <UsersSecurityTabs />

      {!canManage ? (
        <AdminCard>
          <p className="text-sm text-text-muted">Nur Super Admins und Admins dürfen Benutzer einladen oder anlegen.</p>
        </AdminCard>
      ) : null}

      {loading ? (
        <AdminLoadingCard message="Einladungen werden geladen…" />
      ) : invitations.length === 0 ? (
        <div className="admin-invites-empty">
          <div className="admin-invites-empty-icon" aria-hidden>
            📨
          </div>
          <h3 className="font-heading text-lg font-semibold text-text-primary">Noch keine Einladungen vorhanden.</h3>
          <p className="mt-2 max-w-md text-sm text-text-muted">Lade jetzt deinen ersten Mitarbeiter ein.</p>
          {canManage ? (
            <AdminButton variant="primary" className="mt-6" icon={<Mail className="h-4 w-4" />} onClick={() => setDialogOpen(true)}>
              Benutzer einladen
            </AdminButton>
          ) : null}
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {invitations.map((inv) => (
              <AdminCard key={inv.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold">{inv.display_name}</p>
                    <p className="truncate text-sm text-text-muted">{inv.email}</p>
                  </div>
                  <AdminStatusBadge label={STATUS_LABELS[inv.status]} variant={STATUS_VARIANT[inv.status]} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-text-muted">Rolle</dt>
                    <dd>{inv.role_label}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Erstellt</dt>
                    <dd>{formatDate(inv.created_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Läuft ab</dt>
                    <dd>{formatDate(inv.expires_at)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-muted">Erstellt von</dt>
                    <dd>{inv.invited_by_name ?? "—"}</dd>
                  </div>
                </dl>
                {canInvite ? <div className="mt-4">{inviteActions(inv)}</div> : null}
              </AdminCard>
            ))}
          </div>

          <AdminCard className="hidden overflow-x-auto p-0 md:block">
            <table className="admin-users-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Name / E-Mail</th>
                  <th className="text-left">Rolle</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Erstellt von</th>
                  <th className="text-left">Erstellt am</th>
                  <th className="text-left">Läuft ab</th>
                  <th className="text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <p className="font-medium">{inv.display_name}</p>
                      <p className="text-text-muted">{inv.email}</p>
                    </td>
                    <td>{inv.role_label}</td>
                    <td>
                      <AdminStatusBadge label={STATUS_LABELS[inv.status]} variant={STATUS_VARIANT[inv.status]} />
                    </td>
                    <td className="text-text-muted">{inv.invited_by_name ?? "—"}</td>
                    <td className="text-text-muted">{formatDate(inv.created_at)}</td>
                    <td className="text-text-muted">{formatDate(inv.expires_at)}</td>
                    <td>
                      <div className="flex justify-end">{canInvite ? inviteActions(inv) : "—"}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>
        </>
      )}

      <AdminUserManageDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => void load()}
        inviterRole={inviterRole}
        roles={roles}
        canInvite={canInvite}
        canCreateManually={canCreateManually}
        defaultTab="invite"
        toast={toast}
        withLoading={withLoading}
      />
    </div>
  );
}
