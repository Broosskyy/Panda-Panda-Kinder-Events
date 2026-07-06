"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, UserPlus } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { AdminButton, AdminEmptyState, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_MSG } from "@/lib/admin/messages";
import { ADMIN_ROLE_DESCRIPTIONS, ADMIN_ROLE_SHORT } from "@/lib/admin/role-descriptions";
import type { AdminUserPublic, AdminRoleSlug } from "@/lib/auth/types";

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

export function UsersView() {
  const [users, setUsers] = useState<AdminUserPublic[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast, withLoading, fromApi } = useAdminMessages();
  const page = adminPageHeaderProps("benutzer");
  const empty = ADMIN_EMPTY_STATES.users;

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users ?? []);
      setRoles(data.roles ?? []);
      setTeamMembers(data.teamMembers ?? []);
      if (!form.roleId && data.roles?.[0]) {
        setForm((f) => ({ ...f, roleId: data.roles[0].id }));
      }
    } else {
      toast(data.error ?? ADMIN_MSG.loadFailed, "error");
    }
  }, [form.roleId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm(), roleId: roles[0]?.id ?? "" });
    setShowForm(true);
  };

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

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page}>
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Benutzer anlegen
        </AdminButton>
      </AdminPageHeader>

      <SecuritySubNav />

      <AdminCard title="Rollenübersicht">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <div key={role.id} className="rounded-xl border border-border bg-bg-secondary/40 p-3 text-sm">
              <p className="font-semibold text-text-primary">{role.label}</p>
              <p className="mt-1 text-xs text-primary">{ADMIN_ROLE_SHORT[role.slug as AdminRoleSlug] ?? ""}</p>
              <p className="mt-2 text-text-muted">{ADMIN_ROLE_DESCRIPTIONS[role.slug as AdminRoleSlug] ?? ""}</p>
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
            <AdminFormField label="Rolle" required>
              <select className="admin-input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
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

      {users.length === 0 ? (
        <AdminEmptyState
          icon={UserPlus}
          title={empty.title}
          description={empty.description}
          actionLabel={empty.actionLabel}
          onAction={openCreate}
        />
      ) : (
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
                  <AdminButton variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => openEdit(u)}>Bearbeiten</AdminButton>
                  <AdminButton variant="secondary" onClick={() => void toggleActive(u)}>
                    {u.active ? "Deaktivieren" : "Aktivieren"}
                  </AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}
    </div>
  );
}
