"use client";

import type { CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { ADMIN_GLOBAL_QUICK_ACTIONS, filterQuickActions } from "@/lib/admin/quickActions";
import { resolveAdminIcon } from "@/lib/admin/icons";

const HIDE_FAB_PREFIXES = [
  "/admin/einstellungen",
  "/admin/angebote",
  "/admin/rechnungen",
  "/admin/galerie",
  "/admin/bewertungen",
  "/admin/team",
  "/admin/inhalte",
  "/admin/leistungen",
  "/admin/beitraege",
  "/admin/faq",
  "/admin/emails",
  "/admin/sicherheit",
  "/admin/kunden",
  "/admin/anfragen",
  "/admin/analytics",
  "/admin/erste-schritte",
];

export function AdminQuickActions() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { permissions } = useAdminSession();

  const actions = useMemo(
    () => filterQuickActions(ADMIN_GLOBAL_QUICK_ACTIONS, permissions),
    [permissions],
  );

  const hideFab =
    pathname === "/admin" ||
    pathname === "/admin/module" ||
    HIDE_FAB_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  if (hideFab || actions.length === 0) return null;

  return (
    <div className={`admin-quick-actions-global ${open ? "admin-quick-actions-global-open" : ""}`}>
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
