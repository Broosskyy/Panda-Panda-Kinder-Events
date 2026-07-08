"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { SecuritySubNav } from "@/components/admin/SecuritySubNav";
import { UsersSecurityTabs } from "@/components/admin/UsersSecurityTabs";
import { AdminButton, AdminLoadingCard } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { CriticalActionModal } from "@/components/admin/CriticalActionModal";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";

interface AuditLogRow {
  id: string;
  created_at: string;
  user_display_name: string;
  role_slug: string | null;
  action: string;
  area: string;
  entity_id: string | null;
  success: boolean;
  ip_address: string | null;
  user_agent: string | null;
  device_label: string | null;
  os_label: string | null;
  browser_label: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  error_message: string | null;
}

const AREA_OPTIONS = [
  { value: "", label: "Alle Bereiche" },
  { value: "auth", label: "Anmeldung" },
  { value: "admin_users", label: "Benutzer" },
  { value: "crm", label: "CRM" },
  { value: "settings_modules", label: "Module" },
  { value: "settings_email", label: "E-Mail-Einstellungen" },
  { value: "settings_seo", label: "Domain & SEO" },
  { value: "admin_invites", label: "Einladungen" },
  { value: "website", label: "Website" },
  { value: "cms_services", label: "Leistungen" },
];

export function AuditView({ embedded = false }: { embedded?: boolean }) {
  const page = adminPageHeaderProps("audit");
  const [audit, setAudit] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const { permissions } = useAdminSession();
  const canExportAudit = permissions.includes("audit:export");
  const { error: showError, success } = useAdminMessages();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("limit", "200");
    if (area) params.set("area", area);
    if (action) params.set("action", action);
    if (search.trim()) params.set("search", search.trim());
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(`${to}T23:59:59`).toISOString());
    return params.toString();
  }, [action, area, from, search, to]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const res = await fetch(`/api/admin/security/audit?${queryString}`);
    const data = await res.json();
    if (res.ok) {
      setAudit(data.logs ?? []);
    } else {
      const message = data.error ?? "Aktivitätsprotokoll konnte nicht geladen werden.";
      setLoadError(message);
      showError("Aktivitätsprotokoll konnte nicht geladen werden.", message, "Bitte Seite neu laden.");
    }
    setLoading(false);
  }, [queryString, showError]);

  useEffect(() => {
    void load();
  }, [load]);

  const exportLogs = async (format: "csv" | "json", confirmation?: { confirmPassword?: string; criticalAcknowledged?: boolean }) => {
    const params = new URLSearchParams(queryString);
    params.set("format", format);
    const res = await fetch(`/api/admin/security/audit/export?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(confirmation ?? {}),
    });
    if (!res.ok) {
      const data = await res.json();
      if (data.needsPassword || data.needsConfirmation) {
        setExportOpen(true);
        return;
      }
      showError("Export fehlgeschlagen.", data.error ?? "Unbekannter Fehler");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `aktivitaetsprotokoll.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    success("Export wurde erstellt.");
    setExportOpen(false);
  };

  return (
    <div className="admin-page space-y-6">
      <AdminPageHeader {...page} />
      {embedded ? <UsersSecurityTabs /> : <SecuritySubNav />}

      <AdminCard title="Filter & Suche">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AdminFormField label="Suche">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                className="admin-input pl-9"
                placeholder="Name, Aktion, Bereich…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </AdminFormField>
          <AdminFormField label="Bereich">
            <select className="admin-input" value={area} onChange={(e) => setArea(e.target.value)}>
              {AREA_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField label="Aktion">
            <input
              className="admin-input"
              placeholder="z. B. login, create, settings_updated"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            />
          </AdminFormField>
          <AdminFormField label="Von Datum">
            <input className="admin-input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </AdminFormField>
          <AdminFormField label="Bis Datum">
            <input className="admin-input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </AdminFormField>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <AdminButton variant="primary" onClick={() => void load()}>Filtern</AdminButton>
          {canExportAudit ? (
            <>
              <AdminButton variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => void exportLogs("csv")}>
                CSV exportieren
              </AdminButton>
              <AdminButton variant="secondary" icon={<Download className="h-4 w-4" />} onClick={() => void exportLogs("json")}>
                JSON exportieren
              </AdminButton>
            </>
          ) : null}
        </div>
      </AdminCard>

      {loading ? (
        <AdminLoadingCard message="Aktivitätsprotokoll wird geladen…" />
      ) : loadError ? (
        <AdminCard>
          <p className="text-sm text-text-muted">{loadError}</p>
        </AdminCard>
      ) : (
        <AdminCard title={`${audit.length} Einträge`}>
          <ul className="space-y-2 text-sm">
            {audit.length === 0 ? (
              <li className="text-text-muted">Noch keine Einträge für diese Filter.</li>
            ) : (
              audit.map((log) => (
                <li key={log.id} className="rounded-lg border border-border px-3 py-2">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="font-medium">
                      {log.action} · {log.area}
                      {log.entity_id ? ` · ${log.entity_id}` : ""}
                    </span>
                    <span className="text-text-muted">
                      {new Date(log.created_at).toLocaleString("de-DE")}
                    </span>
                  </div>
                  <p className="text-text-muted">
                    {log.user_display_name} ({log.role_slug ?? "—"})
                    {log.success === false ? " — Fehler" : ""}
                  </p>
                  {log.ip_address || log.browser_label || log.device_label || log.country_code ? (
                    <p className="mt-1 text-xs text-text-muted">
                      {[
                        log.ip_address ? `IP: ${log.ip_address}` : null,
                        log.country_code ? log.country_code : null,
                        log.region ? log.region : null,
                        log.city ? log.city : null,
                        log.browser_label ? log.browser_label : null,
                        log.os_label ? log.os_label : null,
                        log.device_label ? log.device_label : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                  {log.error_message ? (
                    <p className="mt-1 text-xs text-red-700">{log.error_message}</p>
                  ) : null}
                </li>
              ))
            )}
          </ul>
        </AdminCard>
      )}

      <CriticalActionModal
        open={exportOpen}
        title="Export bestätigen"
        description="Der Export enthält sensible Aktivitätsdaten. Bitte bestätigen Sie mit Ihrem Passwort."
        onCancel={() => setExportOpen(false)}
        onConfirm={async (confirmation) => exportLogs("csv", confirmation)}
      />
    </div>
  );
}
