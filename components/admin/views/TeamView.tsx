"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Pencil, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton, AdminEmptyState, AdminLoadingCard, AdminStatusBadge } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import { ADMIN_EMPTY_STATES } from "@/lib/admin/page-meta";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import { ADMIN_CONFIRM, ADMIN_MSG } from "@/lib/admin/messages";
import type { TeamMember, TeamSocialLinks } from "@/lib/cms/types";

const emptyForm = () => ({
  name: "",
  position: "",
  description: "",
  profileImageUrl: "",
  phone: "",
  email: "",
  socialLinks: { linkedin: "", instagram: "", facebook: "", website: "" } as TeamSocialLinks,
  sortOrder: 0,
  active: true,
});

export function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState({ title: "Unser Team", subtitle: "" });
  const [configured, setConfigured] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useAdminMessages();
  const { showResult, confirm, runAction } = useAdminActionFeedback();
  const page = adminPageHeaderProps("team");
  const empty = ADMIN_EMPTY_STATES.team;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/team");
    const data = await res.json();
    if (res.ok) {
      setMembers(data.members ?? []);
      setConfigured(data.configured !== false);
      if (data.section) setSection(data.section);
    } else {
      toast(data.error ?? ADMIN_MSG.loadFailed, "error");
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveSection = async () => {
    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/team", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
      },
      success: ACTION_RESULTS.settingsSaved(),
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      position: member.position ?? "",
      description: member.description ?? "",
      profileImageUrl: member.profile_image_url ?? "",
      phone: member.phone ?? "",
      email: member.email ?? "",
      socialLinks: {
        linkedin: member.social_links?.linkedin ?? "",
        instagram: member.social_links?.instagram ?? "",
        facebook: member.social_links?.facebook ?? "",
        website: member.social_links?.website ?? "",
      },
      sortOrder: member.sort_order ?? 0,
      active: member.active,
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) return showResult(ACTION_RESULTS.genericError("Name ist ein Pflichtfeld."));
    if (!form.position.trim()) return showResult(ACTION_RESULTS.genericError("Position ist ein Pflichtfeld."));
    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/team", {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingId ? { id: editingId, ...form } : form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm());
        await load();
      },
      success: ACTION_RESULTS.teamSaved(),
    });
  };

  const toggleVisible = async (member: TeamMember) => {
    const res = await fetch("/api/admin/team", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: member.id, active: !member.active }),
    });
    const data = await res.json();
    if (!res.ok) {
      showResult(ACTION_RESULTS.genericError(data.error ?? "Status konnte nicht geändert werden."));
      return;
    }
    await load();
  };

  const archive = async (id: string) => {
    const ok = await confirm({
      title: "Teammitglied archivieren?",
      message: ADMIN_CONFIRM.archiveTeam.replace(/\n\nFortfahren\?$/, ""),
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/team", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, archived: true, active: false }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Archivieren fehlgeschlagen.");
        await load();
      },
      success: {
        title: "Teammitglied archiviert",
        message: ADMIN_MSG.teamArchived,
        status: "warning",
      },
    });
  };

  const remove = async (id: string) => {
    const ok = await confirm({
      title: "Teammitglied entfernen?",
      message: ADMIN_CONFIRM.removeTeam.replace(/\n\nFortfahren\?$/, ""),
      destructive: true,
      audited: true,
    });
    if (!ok) return;

    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/team", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Entfernen fehlgeschlagen.");
        await load();
      },
      success: {
        title: "Teammitglied entfernt",
        message: ADMIN_MSG.teamRemoved,
        status: "success",
      },
    });
  };

  const activeMembers = members.filter((m) => !m.archived);
  const archivedMembers = members.filter((m) => m.archived);

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader {...page} />
        <AdminLoadingCard message="Team wird geladen…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page}>
        <AdminButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Teammitglied anlegen
        </AdminButton>
      </AdminPageHeader>

      <AdminCard>
        <p className="text-sm text-text-secondary">
          Teammitglieder erscheinen auf der Website im Bereich „Über uns“, wenn sie als <strong>sichtbar</strong> markiert sind.
          Admin-Zugang verwaltest du unter{" "}
          <Link href="/admin/sicherheit/benutzer" className="text-primary underline">Sicherheit → Benutzer & Rollen</Link>.
        </p>
      </AdminCard>

      {!configured ? (
        <AdminCard>
          <p className="text-sm text-accent-heart">
            Datenbank-Migration ausführen: <code>20260712_security_admin_v1.sql</code>
          </p>
        </AdminCard>
      ) : null}

      <AdminCard title="Team-Bereich auf der Website">
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Überschrift" required hint="Wird über dem Team auf der Website angezeigt.">
            <input className="admin-input" value={section.title} onChange={(e) => setSection({ ...section, title: e.target.value })} />
          </AdminFormField>
          <AdminFormField label="Untertitel" hint="Optionaler Text unter der Überschrift.">
            <input className="admin-input" value={section.subtitle} onChange={(e) => setSection({ ...section, subtitle: e.target.value })} />
          </AdminFormField>
        </div>
        <div className="mt-4">
          <AdminButton variant="secondary" onClick={() => void saveSection()}>Überschrift speichern</AdminButton>
        </div>
      </AdminCard>

      {showForm ? (
        <AdminCard title={editingId ? "Teammitglied bearbeiten" : "Neues Teammitglied"}>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Name" required hint="Vollständiger Name auf der Website.">
              <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Position" required hint="z. B. Gründerin, Event-Betreuung">
              <input className="admin-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Foto-URL" hint="Profilbild für die Teamkarte." className="md:col-span-2">
              <input className="admin-input" value={form.profileImageUrl} onChange={(e) => setForm({ ...form, profileImageUrl: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Beschreibung" className="md:col-span-2">
              <textarea className="admin-input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Telefon" hint="Optional, nicht öffentlich auf der Karte.">
              <input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="E-Mail" hint="Optional, nicht öffentlich auf der Karte.">
              <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </AdminFormField>
            <AdminFormField label="Reihenfolge" hint="Kleinere Zahl = weiter oben.">
              <input className="admin-input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </AdminFormField>
            <AdminFormField label="Sichtbar auf Website" required>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                Auf der Website anzeigen
              </label>
            </AdminFormField>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <AdminButton variant="primary" onClick={() => void save()}>{ADMIN_BTN.save}</AdminButton>
            <AdminButton variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>{ADMIN_BTN.cancel}</AdminButton>
          </div>
        </AdminCard>
      ) : null}

      {activeMembers.length === 0 && !showForm ? (
        <AdminEmptyState
          icon={Users}
          title={empty.title}
          description={empty.description}
          actionLabel={empty.actionLabel}
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
                    <p className="font-semibold text-text-primary">{m.name}</p>
                    <p className="text-sm text-text-muted">{m.position}</p>
                    <div className="mt-2">
                      <AdminStatusBadge
                        label={m.active ? "Sichtbar" : "Ausgeblendet"}
                        variant={m.active ? "success" : "muted"}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <AdminButton variant="secondary" icon={<Pencil className="h-4 w-4" />} onClick={() => openEdit(m)}>Bearbeiten</AdminButton>
                  <AdminButton variant="secondary" onClick={() => void toggleVisible(m)}>
                    {m.active ? "Ausblenden" : "Sichtbar machen"}
                  </AdminButton>
                  <AdminButton variant="secondary" icon={<Archive className="h-4 w-4" />} onClick={() => void archive(m.id)}>Archivieren</AdminButton>
                  <AdminButton variant="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => void remove(m.id)}>{ADMIN_BTN.delete}</AdminButton>
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
                <span>{m.name}</span>
                <AdminButton variant="secondary" onClick={() => void remove(m.id)}>{ADMIN_BTN.delete}</AdminButton>
              </div>
            ))}
          </div>
        </AdminCard>
      ) : null}
    </div>
  );
}
