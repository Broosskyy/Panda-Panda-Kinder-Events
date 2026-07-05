"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { ROLE_PERMISSIONS, TEAM_ROLE_DESCRIPTIONS, TEAM_ROLE_LABELS } from "@/lib/admin/roles";
import type { TeamMember, TeamMemberRole } from "@/lib/cms/types";

const ROLE_OPTIONS: { value: TeamMemberRole; label: string }[] = [
  { value: "admin", label: TEAM_ROLE_LABELS.admin },
  { value: "editor", label: TEAM_ROLE_LABELS.editor },
  { value: "readonly", label: TEAM_ROLE_LABELS.readonly },
];

const emptyForm = () => ({
  name: "",
  email: "",
  role: "editor" as TeamMemberRole,
  active: true,
});

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const { toast, withLoading } = useAdminUi();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/team");
    const data = await res.json();
    if (res.ok) setMembers(data.members ?? []);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (!form.name.trim() || !form.email.trim()) return toast("Name und E-Mail erforderlich", "error");
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(data.message ?? "Teammitglied angelegt");
        setShowForm(false);
        setForm(emptyForm());
        await load();
      })(),
    );
  };

  const toggleActive = async (member: TeamMember) => {
    const res = await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, active: !member.active }),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Teammitglied wirklich entfernen?")) return;
    const res = await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    toast("Teammitglied entfernt");
    await load();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Team"
        description="Teammitglieder und Rollen verwalten. Multi-Login folgt in einer späteren Version."
      >
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setShowForm(true)}>
          Teammitglied anlegen
        </AdminButton>
      </AdminPageHeader>

      <AdminCard>
        <p className="text-sm text-text-secondary">
          Aktuell gilt ein globales Admin-Passwort (<code className="rounded bg-bg-secondary px-1">ADMIN_PASSWORD</code>).
          Teammitglieder werden gespeichert und Rollen angezeigt — die Rechteprüfung wird bei der Auth-Umstellung aktiviert.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {ROLE_OPTIONS.map((role) => (
            <div key={role.value} className="rounded-xl border border-border bg-bg-secondary/40 p-3 text-sm">
              <p className="font-semibold text-text-primary">{role.label}</p>
              <p className="mt-1 text-text-muted">{TEAM_ROLE_DESCRIPTIONS[role.value]}</p>
              <p className="mt-2 text-xs text-text-muted">
                {ROLE_PERMISSIONS[role.value].join(", ")}
              </p>
            </div>
          ))}
        </div>
      </AdminCard>

      {showForm ? (
        <AdminCard title="Neues Teammitglied">
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Name" required>
              <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Rolle" required>
              <select className="admin-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as TeamMemberRole })}>
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </AdminFormField>
            <AdminFormField label="Status">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Aktiv
              </label>
            </AdminFormField>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <AdminButton variant="primary" onClick={() => void create()}>Speichern</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowForm(false); setForm(emptyForm()); }}>Abbrechen</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {members.length === 0 ? (
        <AdminEmptyState
          icon={UserCog}
          title="Noch keine Teammitglieder"
          description="Lege Teammitglieder mit Rollen an — für die spätere Multi-Login-Umstellung."
          actionLabel="Teammitglied anlegen"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="space-y-3">
          {members.map((m) => (
            <AdminCard key={m.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">{m.name}</p>
                  <p className="text-sm text-text-muted">{m.email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <AdminStatusBadge label={TEAM_ROLE_LABELS[m.role]} variant="default" />
                    <AdminStatusBadge label={m.active ? "Aktiv" : "Inaktiv"} variant={m.active ? "success" : "muted"} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="secondary" onClick={() => void toggleActive(m)}>
                    {m.active ? "Deaktivieren" : "Aktivieren"}
                  </AdminButton>
                  <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void remove(m.id)}>
                    Entfernen
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
