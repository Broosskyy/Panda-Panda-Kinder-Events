"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { useAdminActionFeedback } from "@/components/admin/AdminActionFeedbackProvider";
import { ACTION_RESULTS } from "@/lib/admin/action-feedback";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { TeamMember, TeamSocialLinks } from "@/lib/cms/types";

interface TeamMemberEditViewProps {
  memberId?: string;
}

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

export function TeamMemberEditView({ memberId }: TeamMemberEditViewProps) {
  const router = useRouter();
  const isNew = !memberId;
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(!isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { showResult, runAction } = useAdminActionFeedback();

  const load = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/team");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Team konnte nicht geladen werden.");
      const member = (data.members ?? []).find((m: TeamMember) => m.id === memberId);
      if (!member) throw new Error("Teammitglied nicht gefunden.");
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
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Teammitglied konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    if (memberId) void load();
  }, [memberId, load]);

  const save = async () => {
    if (!form.name.trim()) return showResult(ACTION_RESULTS.genericError("Name ist ein Pflichtfeld."));
    if (!form.position.trim()) return showResult(ACTION_RESULTS.genericError("Position ist ein Pflichtfeld."));
    await runAction({
      action: async () => {
        const res = await fetch("/api/admin/team", {
          method: memberId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberId ? { id: memberId, ...form } : form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        if (isNew && data.member?.id) router.replace(`/admin/team/${data.member.id}`);
        else if (isNew) router.push("/admin/team");
        else await load();
      },
      success: ACTION_RESULTS.teamSaved(),
    });
  };

  if (loading) return <p className="text-sm text-text-muted">Teammitglied wird geladen…</p>;

  if (loadError) {
    return (
      <AdminCard>
        <p className="text-sm text-accent-heart">{loadError}</p>
        <AdminButton className="mt-4" variant="secondary" href="/admin/team">
          Zurück zur Liste
        </AdminButton>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={isNew ? "Neues Teammitglied" : form.name}
        description="Profil für die Website unter „Über uns“."
      >
        <AdminButton variant="ghost" icon={<ArrowLeft className="h-4 w-4" />} href="/admin/team">
          Zurück zur Liste
        </AdminButton>
      </AdminPageHeader>

      <AdminCard>
        <div className="grid gap-4 md:grid-cols-2">
          <AdminFormField label="Name" required>
            <input className="admin-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </AdminFormField>
          <AdminFormField label="Position" required>
            <input className="admin-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
          </AdminFormField>
          <AdminFormField label="Foto-URL" className="md:col-span-2">
            <input className="admin-input" value={form.profileImageUrl} onChange={(e) => setForm({ ...form, profileImageUrl: e.target.value })} />
          </AdminFormField>
          <AdminFormField label="Beschreibung" className="md:col-span-2">
            <textarea className="admin-input min-h-24" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </AdminFormField>
          <AdminFormField label="Telefon">
            <input className="admin-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </AdminFormField>
          <AdminFormField label="E-Mail">
            <input className="admin-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </AdminFormField>
          <AdminFormField label="Reihenfolge">
            <input className="admin-input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </AdminFormField>
          <AdminFormField label="Sichtbar auf Website">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Auf der Website anzeigen
            </label>
          </AdminFormField>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <AdminButton variant="primary" onClick={() => void save()}>
            {ADMIN_BTN.save}
          </AdminButton>
          <AdminButton variant="secondary" href="/admin/team">
            {ADMIN_BTN.cancel}
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  );
}
