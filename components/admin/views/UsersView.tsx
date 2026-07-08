"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, UserPlus } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminButton, AdminEmptyState, AdminLoadingCard, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_MSG } from "@/lib/admin/messages";
import { DEFAULT_NEW_USER_ROLE_SLUG, describeRoleSlug, shortRoleSlug } from "@/lib/admin/role-descriptions";
import type { AdminUserPublic } from "@/lib/auth/types";

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

interface UsersMeta {
  canListAll: boolean;
  canManageUsers: boolean;
  isLegacy: boolean;
  selfOnly: boolean;
  currentUserId: string | null;
  authenticated: boolean;
  showBootstrap?: boolean;
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
  const { toast, withLoading, fromApi } = useAdminMessages();
  const page = adminPageHeaderProps("benutzer");
  const empty = ADMIN_EMPTY_STATES.users;

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

  const openCreate = () => {
    setEditingId(null);
    const defaultRole =
      roles.find((r) => r.slug === DEFAULT_NEW_USER_ROLE_SLUG) ?? roles.find((r) => r.slug === "employee") ?? roles[0];
    setForm({ ...emptyForm(), roleId: defaultRole?.id ?? "" });
    setShowForm(true);
  };

  const openEdit = (user: AdminUserPublic) => {
    if (user.id === "legacy-session") {
      return toast("Bitte legen Sie zuerst einen echten Admin-Benutzer an.", "error");
    }
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
      return toast("Bitte alle Pflichtfelder ausfüllen.", "error");
    }
    if (!editingId && !form.password) {
      return toast("Passwort ist bei Neuanlage erforderlich.", "error");
    }
    await withLoading(
      (async () => {
        const payload = {
          ...form,
          teamMemberId: form.teamMemberId || null,
          ...(editingId ? { id: editingId, ...(form.password ? { password: form.password, resetPassword: true } : {}) } : {}),
        };
        const res = await fetch("/api/admin/users", {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(ADMIN_MSG.userSaved);
        setShowForm(false);
        setEditingId(null);
        await load();
      })(),
    );
  };

  const toggleActive = async (user: AdminUserPublic) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, active: !user.active }),
    });
    const data = await res.json();
    if (!res.ok) return fromApi(data, "Status konnte nicht geändert werden.");
    await load();
  };

  const showBootstrapEmpty =
    !loading &&
    !loadError &&
    users.length === 0 &&
    Boolean(meta?.showBootstrap) &&
    !meta?.authenticated;

  const showAuthenticatedEmpty = !loading && !loadError && users.length === 0 && Boolean(meta?.authenticated);

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page}>
        {meta?.canManageUsers ? (
          <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
            Benutzer anlegen
          </AdminButton>
        ) : null}
      </AdminPageHeader>

      <SecuritySubNav />

      {meta?.selfOnly ? (
        <AdminCard>
          <p className="text-sm text-text-muted">
            Sie sehen Ihr eigenes Profil. Nur Super Admins dürfen alle Benutzer verwalten.
          </p>
        </AdminCard>
      ) : null}

      {meta?.isLegacy && users.some((u) => u.id === "legacy-session") ? (
        <AdminCard>
          <p className="text-sm text-text-muted">
            Sie sind mit dem Legacy-Zugang angemeldet. Legen Sie einen echten Admin-Benutzer an, um Multi-User und
            2FA zu nutzen.
          </p>
        </AdminCard>
      ) : null}

      <AdminCard title="Rollenübersicht">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-border bg-bg-secondary/40 p-3 text-sm">
              <p className="font-semibold text-text-primary">{role.label}</p>
              <p className="mt-1 text-xs text-primary">{shortRoleSlug(role.slug)}</p>
              <p className="mt-2 text-text-muted">{describeRoleSlug(role.slug)}</p>
            </div>
          ))}
        </div>
      </AdminCard>

      {showForm ? (
        <AdminCard title={editingId ? "Benutzer bearbeiten" : "Neuer Benutzer"}>
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
            <AdminFormField
              label="Passwort"
              required={!editingId}
              hint={editingId ? "Nur ausfüllen zum Zurücksetzen." : "Mindestens 12 Zeichen empfohlen."}
            >
              <input className="admin-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Rolle" required hint="Neue Benutzer erhalten standardmäßig die Rolle Admin — nie automatisch Super Admin.">
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
            <AdminFormField label="Team-Verknüpfung" hint="Optional: öffentliches Teammitglied verknüpfen (kein Login).">
              <select
                className="admin-input"
                value={form.teamMemberId ?? ""}
                onChange={(e) => setForm({ ...form, teamMemberId: e.target.value || null })}
              >
                <option value="">— Keine Verknüpfung —</option>
                {teamMembers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </AdminFormField>
          </div>
          <div className="mt-6 flex gap-2">
            <AdminButton variant="primary" onClick={() => void save()}>{ADMIN_BTN.save}</AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowForm(false)}>{ADMIN_BTN.cancel}</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {loading ? (
        <AdminLoadingCard message="Benutzer werden geladen…" />
      ) : loadError ? (
        <AdminCard>
          <p className="text-sm text-red-700">{loadError}</p>
          <p className="mt-2 text-sm text-text-muted">
            Bitte Seite neu laden. Wenn das Problem bleibt, prüfen Sie die Datenbank-Verbindung.
          </p>
        </AdminCard>
      ) : showAuthenticatedEmpty ? (
        <AdminCard>
          <p className="text-sm text-text-muted">
            Ihr Benutzerprofil konnte nicht geladen werden, obwohl Sie angemeldet sind. Bitte melden Sie sich erneut an
            oder wenden Sie sich an einen Super Admin.
          </p>
        </AdminCard>
      ) : showBootstrapEmpty ? (
        <AdminEmptyState
          icon={UserPlus}
          title={empty.title}
          description={empty.description}
          actionLabel={empty.actionLabel}
          onAction={openCreate}
        />
      ) : users.length === 0 ? null : (
        <div className="space-y-3">
          {users.map((u) => (
            <AdminCard key={u.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{u.display_name}</p>
                  <p className="text-sm text-text-muted">@{u.username} · {u.email}</p>
                  <p className="mt-1 text-xs text-text-muted">Letzter Login: {formatLogin(u.last_login)}</p>
                  {u.team_member_name ? (
                    <p className="mt-1 text-xs text-text-muted">Verknüpft mit Team: {u.team_member_name}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AdminStatusBadge label={u.role_label} variant="default" />
                    <AdminStatusBadge label={u.active ? "Aktiv" : "Deaktiviert"} variant={u.active ? "success" : "muted"} />
                    {u.totp_enabled ? (
                      <AdminStatusBadge label="2FA aktiv" variant="success" />
                    ) : (
                      <AdminStatusBadge label="2FA aus" variant="muted" />
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {meta?.canManageUsers && u.id !== "legacy-session" ? (
                    <>
                      <AdminButton variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => openEdit(u)}>Bearbeiten</AdminButton>
                      <AdminButton variant="secondary" onClick={() => void toggleActive(u)}>
                        {u.active ? "Deaktivieren" : "Aktivieren"}
                      </AdminButton>
                    </>
                  ) : (
                    <AdminStatusBadge label="Nur Ansicht" variant="muted" />
                  )}
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
