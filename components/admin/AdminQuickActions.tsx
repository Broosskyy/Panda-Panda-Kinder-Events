"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { ADMIN_GLOBAL_QUICK_ACTIONS } from "@/lib/admin/quickActions";
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
];

export function AdminQuickActions() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const hideFab = HIDE_FAB_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
  if (hideFab) return null;

  return (
    <div className="admin-quick-actions-global">
      {open ? (
        <>
          <button
            type="button"
            className="admin-quick-actions-backdrop"
            onClick={() => setOpen(false)}
            aria-label="Schnellaktionen schließen"
          />
          <div className="admin-quick-actions-menu" role="menu" aria-label="Schnellaktionen">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold text-text-primary">Schnellaktionen</p>
              <button type="button" className="admin-icon-btn" onClick={() => setOpen(false)} aria-label="Schließen">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="p-2">
              {ADMIN_GLOBAL_QUICK_ACTIONS.map(({ href, label, iconKey, description }) => {
                const Icon = resolveAdminIcon(iconKey);
                return (
                <li key={href}>
                  <Link href={href} className="admin-quick-actions-item" role="menuitem" onClick={() => setOpen(false)}>
                    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>
                      <span className="block text-sm font-medium text-text-primary">{label}</span>
                      {description ? <span className="block text-xs text-text-muted">{description}</span> : null}
                    </span>
                  </Link>
                </li>
                );
              })}
            </ul>
          </div>
        </>
      ) : null}

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
