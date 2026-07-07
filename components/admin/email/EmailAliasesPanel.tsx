"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { AdminCard } from "@/components/admin/AdminSidebar";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { ADMIN_BTN } from "@/lib/admin/buttons";
import type { SiteEmailAliasRecord } from "@/lib/cms/types";

const emptyAlias = (): SiteEmailAliasRecord => ({
  id: "",
  aliasAddress: "",
  forwardTo: "",
  description: "",
  isActive: true,
  sortOrder: 0,
});

export function EmailAliasesPanel() {
  const { toast, withLoading, error: showError } = useAdminMessages();
  const [aliases, setAliases] = useState<SiteEmailAliasRecord[]>([]);
  const [draft, setDraft] = useState<SiteEmailAliasRecord | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/email/aliases");
    const data = await res.json();
    if (res.ok) setAliases(data.aliases ?? []);
  }, []);

  useEffect(() => {
    void withLoading(load());
  }, [load, withLoading]);

  const saveAlias = async (alias: SiteEmailAliasRecord) => {
    await withLoading(
      (async () => {
        const res = await fetch("/api/admin/email/aliases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alias),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Speichern fehlgeschlagen");
        toast(data.message ?? "Alias gespeichert.");
        setDraft(null);
        await load();
      })(),
    );
  };

  const removeAlias = async (id: string) => {
    if (id.startsWith("default-")) return showError("Standard-Aliase können nur bearbeitet, nicht gelöscht werden.");
    await withLoading(
      (async () => {
        const res = await fetch(`/api/admin/email/aliases?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Löschen fehlgeschlagen");
        toast("Alias gelöscht.");
        await load();
      })(),
    );
  };

  return (
    <AdminCard title="Alias & Weiterleitungen">
      <p className="mb-4 text-sm text-text-muted">
        Hier legst du fest, welche E-Mail-Adressen (z. B. kontakt@ oder buchung@) wohin weiterleiten. Später kann jede
        Firma im White-Label-System eigene Aliase verwalten.
      </p>

      <div className="space-y-3">
        {aliases.map((alias) => (
          <div key={alias.id} className="rounded-xl border border-border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <AdminFormField label="Alias-Adresse">
                <input
                  className="admin-input"
                  value={alias.aliasAddress}
                  onChange={(e) =>
                    setAliases((list) =>
                      list.map((a) => (a.id === alias.id ? { ...a, aliasAddress: e.target.value } : a)),
                    )
                  }
                />
              </AdminFormField>
              <AdminFormField label="Zieladresse">
                <input
                  className="admin-input"
                  value={alias.forwardTo}
                  onChange={(e) =>
                    setAliases((list) =>
                      list.map((a) => (a.id === alias.id ? { ...a, forwardTo: e.target.value } : a)),
                    )
                  }
                />
              </AdminFormField>
              <AdminFormField label="Beschreibung" className="md:col-span-2">
                <input
                  className="admin-input"
                  value={alias.description}
                  onChange={(e) =>
                    setAliases((list) =>
                      list.map((a) => (a.id === alias.id ? { ...a, description: e.target.value } : a)),
                    )
                  }
                />
              </AdminFormField>
              <label className="admin-checkbox-row md:col-span-2">
                <input
                  type="checkbox"
                  checked={alias.isActive}
                  onChange={(e) =>
                    setAliases((list) =>
                      list.map((a) => (a.id === alias.id ? { ...a, isActive: e.target.checked } : a)),
                    )
                  }
                />
                <span>Aktiv</span>
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <AdminButton variant="primary" onClick={() => void saveAlias(alias)}>
                {ADMIN_BTN.save}
              </AdminButton>
              {!alias.id.startsWith("default-") ? (
                <AdminButton variant="ghost" icon={<Trash2 className="h-4 w-4" />} onClick={() => void removeAlias(alias.id)}>
                  Löschen
                </AdminButton>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {draft ? (
        <div className="mt-4 rounded-xl border border-dashed border-primary/40 p-4">
          <p className="mb-3 text-sm font-semibold text-text-primary">Neuer Alias</p>
          <div className="grid gap-3 md:grid-cols-2">
            <AdminFormField label="Alias-Adresse">
              <input className="admin-input" value={draft.aliasAddress} onChange={(e) => setDraft({ ...draft, aliasAddress: e.target.value })} placeholder="kontakt@firma.de" />
            </AdminFormField>
            <AdminFormField label="Zieladresse">
              <input className="admin-input" value={draft.forwardTo} onChange={(e) => setDraft({ ...draft, forwardTo: e.target.value })} placeholder="info@firma.de" />
            </AdminFormField>
            <AdminFormField label="Beschreibung" className="md:col-span-2">
              <input className="admin-input" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </AdminFormField>
          </div>
          <div className="mt-3 flex gap-2">
            <AdminButton variant="primary" onClick={() => void saveAlias(draft)}>Anlegen</AdminButton>
            <AdminButton variant="secondary" onClick={() => setDraft(null)}>{ADMIN_BTN.cancel}</AdminButton>
          </div>
        </div>
      ) : (
        <AdminButton className="mt-4" variant="secondary" icon={<Plus className="h-4 w-4" />} onClick={() => setDraft(emptyAlias())}>
          Alias hinzufügen
        </AdminButton>
      )}
    </AdminCard>
  );
}
