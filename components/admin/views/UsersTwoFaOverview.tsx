"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield, ShieldOff } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { UsersSecurityTabs } from "@/components/admin/UsersSecurityTabs";
import { AdminButton, AdminLoadingCard, AdminStatusBadge } from "@/components/admin/ui";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { useAdminMessages } from "@/lib/admin/use-admin-messages";
import { adminPageHeaderProps } from "@/lib/admin/page-header-props";
import type { AdminUserPublic } from "@/lib/auth/types";

export function UsersTwoFaOverview() {
  const [users, setUsers] = useState<AdminUserPublic[]>([]);
  const { isSuperAdmin } = useAdminSession();
  const [loading, setLoading] = useState(true);
  const { toast, fromApi } = useAdminMessages();
  const page = adminPageHeaderProps("twoFa");

  const load = useCallback(async () => {
    setLoading(true);
    const usersRes = await fetch("/api/admin/users");
    const usersData = await usersRes.json();

    if (usersRes.ok) {
      setUsers(usersData.users ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reset2fa = async (user: AdminUserPublic) => {
    if (!confirm(`2FA für ${user.display_name} wirklich zurücksetzen?`)) return;
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset2fa", id: user.id }),
    });
    const data = await res.json();
    if (!res.ok) return fromApi(data, "Zurücksetzen fehlgeschlagen.");
    toast("2FA zurückgesetzt.");
    await load();
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader {...page} />
      <UsersSecurityTabs />

      <AdminCard>
        <p className="text-sm text-text-muted">
          2FA ist für alle Admin-Zugänge verpflichtend. Benutzer ohne 2FA müssen sie beim nächsten Login einrichten.
        </p>
      </AdminCard>

      {loading ? (
        <AdminLoadingCard message="2FA-Status wird geladen…" />
      ) : (
        <AdminCard className="overflow-x-auto p-0">
          <table className="admin-users-table w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Benutzer</th>
                <th className="text-left">Rolle</th>
                <th className="text-left">2FA</th>
                {isSuperAdmin ? <th className="text-right">Aktionen</th> : null}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <p className="font-medium">{u.display_name}</p>
                    <p className="text-text-muted">{u.email}</p>
                  </td>
                  <td>{u.role_label}</td>
                  <td>
                    <AdminStatusBadge
                      label={u.totp_enabled ? "Aktiv" : "Nicht eingerichtet"}
                      variant={u.totp_enabled ? "success" : "warning"}
                    />
                  </td>
                  {isSuperAdmin ? (
                    <td>
                      <div className="flex justify-end">
                        {u.totp_enabled ? (
                          <AdminButton
                            variant="secondary"
                            icon={<ShieldOff className="h-4 w-4" />}
                            onClick={() => void reset2fa(u)}
                          >
                            2FA zurücksetzen
                          </AdminButton>
                        ) : (
                          <span className="flex items-center gap-1 text-text-muted">
                            <Shield className="h-4 w-4" /> Setup ausstehend
                          </span>
                        )}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      )}
    </div>
  );
}
