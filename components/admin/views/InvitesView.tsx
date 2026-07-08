"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Plus, RefreshCw, XCircle } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { UsersSecurityTabs } from "@/components/admin/UsersSecurityTabs";
import { AdminButton, AdminLoadingCard, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_MSG } from "@/lib/admin/messages";
import { describeRoleSlug } from "@/lib/admin/role-descriptions";
import { invitableRoleSlugs } from "@/lib/auth/invite-permissions";
import type { AdminRoleSlug } from "@/lib/auth/types";
import { isActiveRoleSlug } from "@/lib/admin/roles";

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
  pending: "Offen",
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

const emptyForm = () => ({
  displayName: "",
  email: "",
  roleId: "",
  message: "",
});

export function InvitesView() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [canInvite, setCanInvite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
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
    } else if (inviteRes.status === 403) {
      setCanInvite(false);
    } else {
      toast(inviteData.error ?? ADMIN_MSG.loadFailed, "error");
    }

    if (usersRes.ok) {
      const inviter = (inviteData.meta?.inviterRole ?? null) as AdminRoleSlug | null;
      const allowed = inviter ? invitableRoleSlugs(inviter) : [];
      const allRoles = (usersData.roles ?? []) as Role[];
      const filtered = allRoles.filter((r) => isActiveRoleSlug(r.slug) && allowed.includes(r.slug));
      setRoles(filtered);
      if (!form.roleId && filtered.length) {
        setForm((f) => ({ ...f, roleId: filtered[0]!.id }));
      }
    }
    setLoading(false);
  }, [form.roleId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendInvite = async () => {
    if (!form.displayName || !form.email || !form.roleId) {
      return toast("Bitte Name, E-Mail und Rolle ausfüllen.", "error");
    }
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/invites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Einladung fehlgeschlagen");
        toast("Einladung gesendet.");
        setShowForm(false);
        setForm(emptyForm());
        await load();
      })(),
    );
  };

  const patchInvite = async (id: string, action: "resend" | "revoke") => {
    const res = await fetch("/api/admin/invites", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const data = await res.json();
    if (!res.ok) return fromApi(data, "Aktion fehlgeschlagen.");
    toast(action === "resend" ? "Einladung erneut gesendet." : "Einladung widerrufen.");
    await load();
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleString("de-DE");

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page}>
        {canInvite ? (
          <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
            Benutzer einladen
          </AdminButton>
        ) : null}
      </AdminPageHeader>

      <UsersSecurityTabs />

      {!canInvite ? (
        <AdminCard>
          <p className="text-sm text-text-muted">
            Nur Super Admins und Admins dürfen Benutzer einladen.
          </p>
        </AdminCard>
      ) : null}

      {showForm ? (
        <AdminCard title="Benutzer einladen">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Name" required>
              <input className="admin-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Rolle" required>
              <select className="admin-input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              {form.roleId ? (
                <p className="mt-2 text-xs text-text-muted">
                  {describeRoleSlug(roles.find((r) => r.id === form.roleId)?.slug ?? "")}
                </p>
              ) : null}
            </AdminFormField>
            <AdminFormField label="Optionale Nachricht" hint="Wird in der Einladungs-E-Mail angezeigt.">
              <textarea className="admin-input min-h-24" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </AdminFormField>
          </div>
          <div className="mt-6 flex gap-2">
            <AdminButton variant="primary" icon={<Mail className="h-4 w-4" />} onClick={() => void sendInvite()}>
              Einladung senden
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowForm(false)}>{ADMIN_BTN.cancel}</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {loading ? (
        <AdminLoadingCard message="Einladungen werden geladen…" />
      ) : invitations.length === 0 ? (
        <AdminCard>
          <p className="text-sm text-text-muted">Noch keine Einladungen vorhanden.</p>
        </AdminCard>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {invitations.map((inv) => (
              <AdminCard key={inv.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{inv.display_name}</p>
                    <p className="text-sm text-text-muted">{inv.email}</p>
                  </div>
                  <AdminStatusBadge label={STATUS_LABELS[inv.status]} variant={STATUS_VARIANT[inv.status]} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-text-muted">Rolle</dt><dd>{inv.role_label}</dd></div>
                  <div><dt className="text-text-muted">Ablauf</dt><dd>{formatDate(inv.expires_at)}</dd></div>
                </dl>
                {inv.status === "pending" && canInvite ? (
                  <div className="mt-3 flex gap-2">
                    <AdminButton variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void patchInvite(inv.id, "resend")}>
                      Erneut senden
                    </AdminButton>
                    <AdminButton variant="secondary" icon={<XCircle className="h-4 w-4" />} onClick={() => void patchInvite(inv.id, "revoke")}>
                      Widerrufen
                    </AdminButton>
                  </div>
                ) : null}
              </AdminCard>
            ))}
          </div>

          <AdminCard className="hidden overflow-x-auto p-0 md:block">
            <table className="admin-users-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">E-Mail</th>
                  <th className="text-left">Rolle</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Ablaufdatum</th>
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
                    <td><AdminStatusBadge label={STATUS_LABELS[inv.status]} variant={STATUS_VARIANT[inv.status]} /></td>
                    <td className="text-text-muted">{formatDate(inv.expires_at)}</td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        {inv.status === "pending" && canInvite ? (
                          <>
                            <AdminButton variant="secondary" icon={<RefreshCw className="h-4 w-4" />} onClick={() => void patchInvite(inv.id, "resend")}>
                              Erneut senden
                            </AdminButton>
                            <AdminButton variant="secondary" icon={<XCircle className="h-4 w-4" />} onClick={() => void patchInvite(inv.id, "revoke")}>
                              Widerrufen
                            </AdminButton>
                          </>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>
        </>
      )}
    </div>
  );
}
