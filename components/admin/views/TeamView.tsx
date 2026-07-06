"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Pencil, Plus, Trash2, UserCog } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { TEAM_ROLE_LABELS } from "@/lib/admin/roles";
import type { TeamMember, TeamMemberRole, TeamSocialLinks } from "@/lib/cms/types";

const ROLE_OPTIONS: { value: TeamMemberRole; label: string }[] = [
  { value: "admin", label: TEAM_ROLE_LABELS.admin },
  { value: "editor", label: TEAM_ROLE_LABELS.editor },
  { value: "readonly", label: TEAM_ROLE_LABELS.readonly },
];

const emptyForm = () => ({
  firstName: "",
  lastName: "",
  username: "",
  displayName: "",
  email: "",
  title: "",
  position: "",
  description: "",
  profileImageUrl: "",
  phone: "",
  socialLinks: { linkedin: "", instagram: "", facebook: "", website: "" } as TeamSocialLinks,
  sortOrder: 0,
  role: "editor" as TeamMemberRole,
  active: true,
});

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [configured, setConfigured] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast, withLoading } = useAdminUi();

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/team");
    const data = await res.json();
    if (res.ok) {
      setMembers(data.members ?? []);
      setConfigured(data.configured !== false);
    } else {
      toast(data.error ?? "Laden fehlgeschlagen", "error");
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setForm({
      firstName: member.first_name ?? "",
      lastName: member.last_name ?? "",
      username: member.username ?? "",
      displayName: member.display_name ?? member.name,
      email: member.email,
      title: member.title ?? "",
      position: member.position ?? "",
      description: member.description ?? "",
      profileImageUrl: member.profile_image_url ?? "",
      phone: member.phone ?? "",
      socialLinks: {
        linkedin: member.social_links?.linkedin ?? "",
        instagram: member.social_links?.instagram ?? "",
        facebook: member.social_links?.facebook ?? "",
        website: member.social_links?.website ?? "",
      },
      sortOrder: member.sort_order ?? 0,
      role: member.role,
      active: member.active,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.email.trim()) return toast("E-Mail erforderlich", "error");
    await withLoading(
      (async () => {
        const payload = {
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username || undefined,
          displayName: form.displayName,
          email: form.email,
          title: form.title,
          position: form.position,
          description: form.description,
          profileImageUrl: form.profileImageUrl,
          phone: form.phone,
          socialLinks: form.socialLinks,
          sortOrder: form.sortOrder,
          role: form.role,
          active: form.active,
        };

        const res = await fetch("/api/admin/team", {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(data.message ?? "Gespeichert");
        setShowForm(false);
        setEditingId(null);
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

  const archive = async (id: string) => {
    if (!confirm("Teammitglied archivieren?")) return;
    const res = await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, archived: true, active: false }),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    toast("Archiviert");
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Teammitglied endgültig löschen?")) return;
    const res = await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!res.ok) return toast(data.error ?? "Fehler", "error");
    toast("Entfernt");
    await load();
  };

  const activeMembers = members.filter((m) => !m.archived);
  const archivedMembers = members.filter((m) => m.archived);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Team"
        description="Teammitglieder mit Profil, Kontakt und Social Links verwalten."
      >
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Teammitglied anlegen
        </AdminButton>
      </AdminPageHeader>

      {!configured ? (
        <AdminCard>
          <p className="text-sm text-accent-heart">
            Die Tabelle <code>team_members</code> ist noch nicht migriert. Bitte Migration{" "}
            <code>20260712_security_admin_v1.sql</code> ausführen.
          </p>
        </AdminCard>
      ) : null}

      {showForm ? (
        <AdminCard title={editingId ? "Teammitglied bearbeiten" : "Neues Teammitglied"}>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Vorname">
              <input className="admin-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Nachname">
              <input className="admin-input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Benutzername">
              <input className="admin-input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Anzeigename">
              <input className="admin-input" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="E-Mail" required>
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Telefon">
              <input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Titel">
              <input className="admin-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Position">
              <input className="admin-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Profilbild URL" className="md:col-span-2">
              <input className="admin-input" value={form.profileImageUrl} onChange={(e) => setForm({ ...form, profileImageUrl: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Beschreibung" className="md:col-span-2">
              <textarea className="admin-input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="LinkedIn">
              <input className="admin-input" value={form.socialLinks.linkedin ?? ""} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })} />
            </AdminFormField>
            <AdminFormField label="Instagram">
              <input className="admin-input" value={form.socialLinks.instagram ?? ""} onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })} />
            </AdminFormField>
            <AdminFormField label="Reihenfolge">
              <input className="admin-input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
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
            <AdminButton variant="primary" onClick={() => void save()}>Speichern</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Abbrechen</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {activeMembers.length === 0 && !showForm ? (
        <AdminEmptyState
          icon={UserCog}
          title="Noch keine Teammitglieder"
          description="Lege Teammitglieder mit vollständigem Profil an."
          actionLabel="Teammitglied anlegen"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-3">
          {activeMembers.map((m) => (
            <AdminCard key={m.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex gap-3">
                  {m.profile_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.profile_image_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                  ) : null}
                  <div>
                    <p className="font-semibold text-text-primary">{m.display_name || m.name}</p>
                    <p className="text-sm text-text-muted">{m.position || m.title}</p>
                    <p className="text-sm text-text-muted">{m.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <AdminStatusBadge label={TEAM_ROLE_LABELS[m.role]} variant="default" />
                      <AdminStatusBadge label={m.active ? "Aktiv" : "Inaktiv"} variant={m.active ? "success" : "muted"} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => openEdit(m)}>Bearbeiten</AdminButton>
                  <AdminButton variant="secondary" onClick={() => void toggleActive(m)}>
                    {m.active ? "Deaktivieren" : "Aktivieren"}
                  </AdminButton>
                  <AdminButton variant="secondary" icon={<Archive className="h-4 w-4" />} onClick={() => void archive(m.id)}>Archivieren</AdminButton>
                  <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void remove(m.id)}>Löschen</AdminButton>
                </div>
              </div>
            </AdminCard>
          ))}
        </div>
      )}

      {archivedMembers.length > 0 ? (
        <AdminCard title="Archiviert">
          <div className="space-y-2">
            {archivedMembers.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-sm">
                <span>{m.display_name || m.name}</span>
                <AdminButton variant="secondary" onClick={() => void remove(m.id)}>Löschen</AdminButton>
              </div>
            ))}
          </div>
        </AdminCard>
      ) : null}
    </div>
  );
}
