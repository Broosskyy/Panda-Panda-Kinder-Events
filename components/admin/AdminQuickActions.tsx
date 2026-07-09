"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ADMIN_GLOBAL_QUICK_ACTIONS, filterQuickActions } from "@/lib/admin/quickActions";
import { resolveAdminIcon } from "@/lib/admin/icons";
import { useScrollVisible } from "@/lib/admin/use-scroll-visible";
import { isAdminHomePath } from "@/lib/admin/routes";

export function AdminQuickActions() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { permissions } = useAdminSession();
  const scrollVisible = useScrollVisible(isAdminHomePath(pathname ?? ""));

  const actions = useMemo(
    () => filterQuickActions(ADMIN_GLOBAL_QUICK_ACTIONS, permissions),
    [permissions],
  );

  // FAB only on dashboard; hidden on mobile (quick actions + bottom nav cover needs).
  const showFab = isAdminHomePath(pathname ?? "") && actions.length > 0;
  if (!showFab) return null;

  return (
    <div
      className={`admin-quick-actions-global hidden md:flex ${open ? "admin-quick-actions-global-open" : ""} ${scrollVisible ? "" : "admin-quick-actions-global-hidden"}`}
    >
      {open ? (
        <button
          type="button"
          className="admin-quick-actions-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Schnellaktionen schließen"
        />
      ) : null}

      <ul className="admin-speed-dial" aria-label="Schnellaktionen">
        {open
          ? actions.map((action, index) => {
              const Icon = resolveAdminIcon(action.iconKey);
              return (
                <li
                  key={action.href}
                  className="admin-speed-dial-item-wrap"
                  style={{ ["--speed-dial-index" as string]: String(index) } as CSSProperties}
                >
                  <Link
                    href={action.href}
                    className="admin-speed-dial-item"
                    onClick={() => setOpen(false)}
                    title={action.label}
                  >
                    <span className="admin-speed-dial-label">{action.label}</span>
                    <span className="admin-speed-dial-btn">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })
          : null}
      </ul>

      <button
        type="button"
        className="admin-quick-actions-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Schnellaktionen schließen" : "Schnellaktionen öffnen"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
      </button>
    </div>
  );
}
