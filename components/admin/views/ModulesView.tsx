"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AdminPageHeader } from "@/components/admin/AdminSidebar";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { filterAdminNavGroups } from "@/lib/admin/filter-nav";
import { resolveAdminIcon } from "@/lib/admin/icons";

export function ModulesView() {
  const { permissions, modules } = useAdminSession();

  const groups = useMemo(
    () => filterAdminNavGroups(permissions.length ? permissions : ["dashboard:read"], modules),
    [permissions, modules],
  );

  return (
    <div className="dash-v2-modules space-y-8">
      <AdminPageHeader
        title="Alle Module"
        description="Übersicht aller Admin-Bereiche — kompakt und nach Berechtigung gefiltert."
      />
      <div className="space-y-6">
        {groups.map((group) => (
          <section key={group.id}>
            {group.label ? <h2 className="dash-v2-section-title mb-3">{group.label}</h2> : null}
            <div className="dash-v2-modules-grid">
              {group.items.map((item) => {
                const Icon = resolveAdminIcon(item.iconKey);
                return (
                  <Link key={item.href} href={item.href} className="dash-v2-module-card">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
