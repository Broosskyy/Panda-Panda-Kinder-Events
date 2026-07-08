"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/sicherheit/benutzer", label: "Benutzer", exact: true },
  { href: "/admin/sicherheit/benutzer/einladungen", label: "Einladungen" },
  { href: "/admin/sicherheit/benutzer/2fa", label: "2FA" },
  { href: "/admin/sicherheit/benutzer/login-historie", label: "Login-Historie" },
  { href: "/admin/sicherheit/benutzer/aktivitaet", label: "Aktivitätsprotokoll" },
] as const;

export function UsersSecurityTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-4" aria-label="Benutzer & Rollen">
      {TABS.map((tab) => {
        const active = "exact" in tab && tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active ? "bg-primary text-white" : "border border-border bg-bg-card text-text-secondary hover:border-primary/30"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
