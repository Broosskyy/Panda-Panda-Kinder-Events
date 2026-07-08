"use client";

import { useCallback, useEffect, useState } from "react";
import { KeyRound, Pencil, Plus, Shield, ShieldOff, Trash2, UserRound } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminUserManageDialog } from "@/components/admin/AdminUserManageDialog";
import { CriticalActionModal } from "@/components/admin/CriticalActionModal";
import { UsersSecurityTabs } from "@/components/admin/UsersSecurityTabs";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { AdminActionMenu, AdminButton, AdminLoadingCard, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_MSG } from "@/lib/admin/messages";
import { DEFAULT_NEW_USER_ROLE_SLUG, describeRoleSlug, shortRoleSlug } from "@/lib/admin/role-descriptions";
import type { AdminRoleSlug, AdminUserPublic } from "@/lib/auth/types";

interface Role {
  id: string;
  slug: string;
  label: string;
}

interface TeamOption {
  id: string;
  name: string;
}

const emptyForm = () => ({
  username: "",
  email: "",
  password: "",
  displayName: "",
  roleId: "",
  phone: "",
  teamMemberId: "" as string | null,
});

function formatLogin(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("de-DE");
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString("de-DE");
}

function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

interface UsersMeta {
  canListAll: boolean;
  canManageUsers: boolean;
  canInvite: boolean;
  canCreateUsers: boolean;
  inviterRole: AdminRoleSlug;
  selfOnly: boolean;
  currentUserId: string | null;
  authenticated: boolean;
}

export function UsersView() {
  const [users, setUsers] = useState<AdminUserPublic[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamOption[]>([]);
  const [meta, setMeta] = useState<UsersMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserPublic | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useAdminMessages();
  const { showResult, confirm, runAction } = useAdminActionFeedback();
  const page = adminPageHeaderProps("benutzer");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users ?? []);
      setRoles(data.roles ?? []);
      setTeamMembers(data.teamMembers ?? []);
      setMeta(data.meta ?? null);
      if (!form.roleId && data.roles?.length) {
        const defaultRole =
          data.roles.find((r: Role) => r.slug === DEFAULT_NEW_USER_ROLE_SLUG) ?? data.roles[0];
        setForm((f) => ({ ...f, roleId: defaultRole.id }));
      }
    } else {
      setLoadError(data.error ?? ADMIN_MSG.loadFailed);
      toast(data.error ?? ADMIN_MSG.loadFailed, "error");
    }
    setLoading(false);
  }, [form.roleId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openEdit = (user: AdminUserPublic) => {
    setEditingId(user.id);
    setForm({
      username: user.username,
      email: user.email,
      password: "",
      displayName: user.display_name,
      roleId: user.role_id,
      phone: user.phone ?? "",
      teamMemberId: user.team_member_id ?? "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.username || !form.email || !form.displayName || !form.roleId) {
      return showResult(ACTION_RESULTS.genericError("Bitte alle Pflichtfelder ausfüllen."));
    }
    await runAction({
      action: async () => {
        const payload = {
          ...form,
          teamMemberId: form.teamMemberId || null,
          ...(editingId
            ? { id: editingId, ...(form.password ? { password: form.password, resetPassword: true } : {}) }
            : {}),
        };
        const res = await fetch("/api/admin/users", {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        setShowForm(false);
        setEditingId(null);
        await load();
      },
      success: editingId ? ACTION_RESULTS.userSaved() : ACTION_RESULTS.userCreated(),
    });
  };

  const toggleActive = async (user: AdminUserPublic) => {
    if (user.active) {
      const ok = await confirm({
        title: "Benutzer deaktivieren?",
        message: "Der Benutzer kann sich danach nicht mehr anmelden.",
        destructive: true,
        audited: true,
      });
      if (!ok) return;
    }

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id, active: !user.active }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Status konnte nicht geändert werden.");
        await load();
        return { wasActive: user.active };
      },
      success: (result) =>
        result.wasActive
          ? ACTION_RESULTS.userDeactivated()
          : {
              title: "Benutzer aktiviert",
              message: "Der Benutzer kann sich wieder anmelden.",
              status: "success" as const,
            },
    });
  };

  const reset2fa = async (user: AdminUserPublic) => {
    const ok = await confirm({
      title: "2FA zurücksetzen?",
      message: "Die Zwei-Faktor-Authentifizierung des Benutzers wird zurückgesetzt.",
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id, action: "reset2fa" }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "2FA konnte nicht zurückgesetzt werden.");
        await load();
      },
      success: ACTION_RESULTS.twoFaReset(),
    });
  };

  const showAuthenticatedEmpty = !loading && !loadError && users.length === 0 && Boolean(meta?.authenticated);
  const isCurrentUser = (id: string) => meta?.currentUserId === id;
  const canManage = Boolean(meta?.canInvite || meta?.canCreateUsers);
  const isSuperAdmin = meta?.inviterRole === "administrator";

  const userActions = (u: AdminUserPublic) => {
    if (!meta?.canManageUsers) {
      return (
        <AdminButton variant="secondary" icon={<UserRound className="h-4 w-4" />} onClick={() => openEdit(u)}>
          Profil
        </AdminButton>
      );
    }

    return (
      <AdminActionMenu
        primary={{
          label: "Bearbeiten",
          icon: <Pencil className="h-4 w-4" />,
          onClick: () => openEdit(u),
        }}
        items={[
          {
            id: "role",
            label: "Rolle ändern",
            icon: <Shield className="h-4 w-4" />,
            onClick: () => openEdit(u),
          },
          {
            id: "password",
            label: "Passwort zurücksetzen",
            icon: <KeyRound className="h-4 w-4" />,
            onClick: () => openEdit(u),
          },
          {
            id: "2fa",
            label: "2FA zurücksetzen",
            icon: <ShieldOff className="h-4 w-4" />,
            onClick: () => reset2fa(u),
            hidden: !isSuperAdmin || isCurrentUser(u.id),
          },
          {
            id: "toggle",
            label: u.active ? "Deaktivieren" : "Aktivieren",
            onClick: () => toggleActive(u),
            hidden: isCurrentUser(u.id),
          },
        ]}
        dangerItems={[
          {
            id: "delete",
            label: "Löschen",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: () => setDeleteTarget(u),
            hidden: isCurrentUser(u.id),
          },
        ]}
      />
    );
  };

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

      {meta?.selfOnly ? (
        <AdminCard>
          <p className="text-sm text-text-muted">
            Sie sehen Ihr eigenes Profil. Nur Super Admins dürfen alle Benutzer verwalten.
          </p>
        </AdminCard>
      ) : null}

      <details className="admin-card admin-roles-collapse">
        <summary className="admin-card-title cursor-pointer list-none marker:content-none">Rollenübersicht</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-border bg-bg-secondary/40 p-3 text-sm">
              <p className="font-semibold text-text-primary">{role.label}</p>
              <p className="mt-1 text-xs text-primary">{shortRoleSlug(role.slug)}</p>
              <p className="mt-2 text-text-muted">{describeRoleSlug(role.slug)}</p>
            </div>
          ))}
        </div>
      </details>

      {showForm ? (
        <AdminCard title={editingId ? "Benutzer bearbeiten" : "Benutzer bearbeiten"}>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Benutzername" required hint="Für die Anmeldung.">
              <input className="admin-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required hint="Für Login und Passwort-Reset.">
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Anzeigename" required>
              <input className="admin-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Passwort" hint="Nur ausfüllen zum Zurücksetzen.">
              <input className="admin-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Rolle" required>
              <select className="admin-input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Team-Verknüpfung" hint="Optional: öffentliches Teammitglied verknüpfen.">
              <select
                className="admin-input"
                value={form.teamMemberId ?? ""}
                onChange={(e) => setForm({ ...form, teamMemberId: e.target.value || null })}
              >
                <option value="">— Keine Verknüpfung —</option>
                {teamMembers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </AdminFormField>
          </div>
          <div className="mt-6 flex gap-2">
            <AdminButton variant="primary" onClick={() => void save()}>
              {ADMIN_BTN.save}
            </AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowForm(false)}>
              {ADMIN_BTN.cancel}
            </AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {loading ? (
        <AdminLoadingCard message="Benutzer werden geladen…" />
      ) : loadError ? (
        <AdminCard>
          <p className="text-sm text-red-700">{loadError}</p>
        </AdminCard>
      ) : showAuthenticatedEmpty ? (
        <AdminCard>
          <p className="text-sm text-text-muted">Ihr Benutzerprofil konnte nicht geladen werden.</p>
        </AdminCard>
      ) : users.length === 0 ? null : (
        <>
          <div className="space-y-3 md:hidden">
            {users.map((u) => (
              <AdminCard key={u.id} className={isCurrentUser(u.id) ? "admin-user-card-current" : ""}>
                <div className="admin-user-card">
                  <div className="admin-user-card-header">
                    <div className="admin-users-avatar" aria-hidden>
                      {u.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={u.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                      ) : (
                        userInitials(u.display_name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-text-primary">{u.display_name}</p>
                      <p className="truncate text-sm text-text-muted">{u.email || "—"}</p>
                    </div>
                    <AdminStatusBadge label={u.active ? "Aktiv" : "Deaktiviert"} variant={u.active ? "success" : "muted"} />
                  </div>
                  <dl className="admin-user-card-meta">
                    <div>
                      <dt>Rolle</dt>
                      <dd>
                        <AdminStatusBadge label={u.role_label} variant="default" />
                      </dd>
                    </div>
                    <div>
                      <dt>2FA</dt>
                      <dd>
                        <AdminStatusBadge
                          label={u.totp_enabled ? "Aktiv" : "Ausstehend"}
                          variant={u.totp_enabled ? "success" : "warning"}
                        />
                      </dd>
                    </div>
                    <div>
                      <dt>Letzter Login</dt>
                      <dd>{formatLogin(u.last_login)}</dd>
                    </div>
                    <div>
                      <dt>Erstellt am</dt>
                      <dd>{formatDate(u.created_at)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt>Erstellt von</dt>
                      <dd>{u.created_by_name ?? "—"}</dd>
                    </div>
                  </dl>
                  <div className="admin-user-card-actions">{userActions(u)}</div>
                </div>
              </AdminCard>
            ))}
          </div>

          <AdminCard className="hidden overflow-x-auto p-0 md:block">
            <table className="admin-users-table w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Benutzer</th>
                  <th className="text-left">Rolle</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">2FA</th>
                  <th className="text-left">Letzter Login</th>
                  <th className="text-left">Erstellt am</th>
                  <th className="text-left">Erstellt von</th>
                  <th className="text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={isCurrentUser(u.id) ? "admin-users-row-current" : undefined}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="admin-users-avatar" aria-hidden>
                          {u.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={u.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                          ) : (
                            userInitials(u.display_name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text-primary">{u.display_name}</p>
                          <p className="truncate text-text-muted">{u.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <AdminStatusBadge label={u.role_label} variant="default" />
                    </td>
                    <td>
                      <AdminStatusBadge label={u.active ? "Aktiv" : "Deaktiviert"} variant={u.active ? "success" : "muted"} />
                    </td>
                    <td>
                      <AdminStatusBadge
                        label={u.totp_enabled ? "Aktiv" : "Ausstehend"}
                        variant={u.totp_enabled ? "success" : "warning"}
                      />
                    </td>
                    <td className="text-text-muted">{formatLogin(u.last_login)}</td>
                    <td className="text-text-muted">{formatDate(u.created_at)}</td>
                    <td className="text-text-muted">{u.created_by_name ?? "—"}</td>
                    <td>
                      <div className="flex justify-end">{userActions(u)}</div>
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
        inviterRole={meta?.inviterRole ?? "readonly"}
        roles={roles}
        canInvite={Boolean(meta?.canInvite)}
        canCreateManually={Boolean(meta?.canCreateUsers)}
        defaultTab="invite"
      />

      <CriticalActionModal
        open={Boolean(deleteTarget)}
        title="Benutzer löschen?"
        description={
          deleteTarget
            ? `„${deleteTarget.display_name}" wird dauerhaft gelöscht. Aktive Sitzungen werden beendet.`
            : ""
        }
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async ({ confirmPassword }) => {
          if (!deleteTarget) return;
          setDeleteLoading(true);
          const res = await fetch("/api/admin/users", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: deleteTarget.id, confirmPassword }),
          });
          const data = await res.json();
          setDeleteLoading(false);
          if (!res.ok) throw new Error(data.error ?? "Löschen fehlgeschlagen");
          showResult(ACTION_RESULTS.userDeleted());
          setDeleteTarget(null);
          await load();
        }}
      />
    </div>
  );
}
