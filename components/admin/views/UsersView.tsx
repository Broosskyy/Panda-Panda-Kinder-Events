"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import type { AdminUserPublic } from "@/lib/auth/types";

interface Role {
  id: string;
  slug: string;
  label: string;
}

const emptyForm = () => ({
  username: "",
  email: "",
  password: "",
  displayName: "",
  roleId: "",
  phone: "",
});

export function UsersView() {
  const [users, setUsers] = useState<AdminUserPublic[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast, withLoading } = useAdminUi();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users ?? []);
      setRoles(data.roles ?? []);
      if (!form.roleId && data.roles?.[0]) {
        setForm((f) => ({ ...f, roleId: data.roles[0].id }));
      }
    } else {
      toast(data.error ?? "Laden fehlgeschlagen", "error");
    }
  }, [form.roleId, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!form.username || !form.email || !form.password || !form.displayName) {
      return toast("Alle Pflichtfelder ausfüllen", "error");
    }
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(data.message ?? "Benutzer angelegt");
        setShowForm(false);
        setForm(emptyForm());
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
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    await load();
  };

  const changeRole = async (userId: string, roleId: string) => {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, roleId }),
    });
    if (!res.ok) {
      const data = await res.json();
      return toast(data.error ?? "Fehler", "error");
    }
    await load();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Benutzer" description="Admin-Benutzer, Rollen und Zugriffsrechte verwalten.">
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
          Benutzer anlegen
        </AdminButton>
      </AdminPageHeader>

      {showForm ? (
        <AdminCard title="Neuer Benutzer">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Benutzername" required>
              <input className="admin-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Anzeigename" required>
              <input className="admin-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Passwort" required>
              <input className="admin-input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Rolle" required>
              <select className="admin-input" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Telefon">
              <input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </AdminFormField>
          </div>
          <div className="mt-6 flex gap-2">
            <AdminButton variant="primary" onClick={() => void create()}>Speichern</AdminButton>
            <AdminButton variant="secondary" onClick={() => setShowForm(false)}>Abbrechen</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {users.length === 0 ? (
        <AdminEmptyState
          icon={UserPlus}
          title="Noch keine Benutzer"
          description="Lege den ersten Admin-Benutzer an oder nutze den Bootstrap-Endpunkt."
          actionLabel="Benutzer anlegen"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <AdminCard key={u.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{u.display_name}</p>
                  <p className="text-sm text-text-muted">@{u.username} · {u.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AdminStatusBadge label={u.role_label} variant="default" />
                    <AdminStatusBadge label={u.active ? "Aktiv" : "Deaktiviert"} variant={u.active ? "success" : "muted"} />
                    {u.totp_enabled ? <AdminStatusBadge label="2FA" variant="success" /> : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="admin-input text-sm"
                    value={u.role_id}
                    onChange={(e) => void changeRole(u.id, e.target.value)}
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
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
