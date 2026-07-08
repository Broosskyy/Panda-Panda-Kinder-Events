"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Mail, Plus, RefreshCw, Trash2, XCircle } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminUserManageDialog } from "@/components/admin/AdminUserManageDialog";
import { UsersSecurityTabs } from "@/components/admin/UsersSecurityTabs";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { AdminActionMenu, AdminButton, AdminLoadingCard, AdminStatusBadge } from "@/components/admin/ui";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
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
  email_delivery_status?: "sent" | "failed" | "pending";
  last_email_sent_at?: string | null;
  last_email_error?: string | null;
}

const EMAIL_STATUS_LABELS: Record<NonNullable<Invitation["email_delivery_status"]>, string> = {
  sent: "Gesendet",
  failed: "Fehlgeschlagen",
  pending: "Ausstehend",
};

const EMAIL_STATUS_VARIANT: Record<NonNullable<Invitation["email_delivery_status"]>, "success" | "warning" | "muted" | "default"> = {
  sent: "success",
  failed: "default",
  pending: "warning",
};

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
  const { toast } = useAdminMessages();
  const { confirm, runAction } = useAdminActionFeedback();
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
    if (action === "revoke") {
      const ok = await confirm({
        title: "Einladung widerrufen?",
        message: "Die Einladung ist danach nicht mehr gültig.",
        destructive: true,
        audited: true,
      });
      if (!ok) return;
    }

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/invites", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Aktion fehlgeschlagen.");

        if (action === "copy_link" && data.inviteUrl) {
          try {
            await navigator.clipboard.writeText(data.inviteUrl);
          } catch {
            throw new Error("Link erstellt, Zwischenablage nicht verfügbar.");
          }
        }

        await load();
        return { action, data };
      },
      success: ({ action: act, data }) => {
        if (act === "copy_link") return ACTION_RESULTS.linkCopied();
        if (act === "resend") {
          if (data.emailSent === false && data.emailError) {
            return ACTION_RESULTS.genericError(`E-Mail konnte nicht versendet werden. ${data.emailError}`);
          }
          return {
            title: "E-Mail erfolgreich versendet",
            message: "Die Einladung wurde erneut an den Empfänger geschickt.",
            status: "success" as const,
          };
        }
        if (act === "revoke") return ACTION_RESULTS.inviteRevoked();
        return ACTION_RESULTS.inviteSent();
      },
    });
  };

  const deleteInvite = async (id: string) => {
    const ok = await confirm({
      title: "Einladung löschen?",
      message: "Die Einladung wird dauerhaft entfernt.",
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/invites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Löschen fehlgeschlagen.");
        await load();
      },
      success: {
        title: "Einladung gelöscht",
        message: "Die Einladung wurde entfernt.",
        status: "success",
      },
    });
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("de-DE");
  const emailStatus = (inv: Invitation) => inv.email_delivery_status ?? "pending";

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
          onClick: () => void deleteInvite(inv.id),
        },
      ]}
    />
  );

  const canManage = canInvite || canCreateManually;

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
                    <dt className="text-text-muted">Versand</dt>
                    <dd>
                      <AdminStatusBadge
                        label={EMAIL_STATUS_LABELS[emailStatus(inv)]}
                        variant={EMAIL_STATUS_VARIANT[emailStatus(inv)]}
                      />
                    </dd>
                  </div>
                  {inv.last_email_sent_at ? (
                    <div className="col-span-2">
                      <dt className="text-text-muted">Zuletzt gesendet</dt>
                      <dd>{formatDate(inv.last_email_sent_at)}</dd>
                    </div>
                  ) : null}
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
                  <th className="text-left">Versandstatus</th>
                  <th className="text-left">Zuletzt gesendet</th>
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
                    <td>
                      <AdminStatusBadge
                        label={EMAIL_STATUS_LABELS[emailStatus(inv)]}
                        variant={EMAIL_STATUS_VARIANT[emailStatus(inv)]}
                      />
                    </td>
                    <td className="text-text-muted">
                      {inv.last_email_sent_at ? formatDate(inv.last_email_sent_at) : "—"}
                    </td>
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
      />
    </div>
  );
}
