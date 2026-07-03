"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HelpCircle,
  Home,
  Image,
  Inbox,
  Layout,
  LogOut,
  Newspaper,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/anfragen", label: "Anfragen", icon: Inbox },
  { href: "/admin/bewertungen", label: "Bewertungen", icon: Star },
  { href: "/admin/galerie", label: "Galerie", icon: Image },
  { href: "/admin/beitraege", label: "Beiträge", icon: Newspaper },
  { href: "/admin/leistungen", label: "Leistungen", icon: Sparkles },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/inhalte", label: "Website Inhalte", icon: Layout },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin";
  };

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-border bg-bg-card md:flex md:flex-col">
        <div className="border-b border-border px-5 py-5">
          <p className="font-heading text-lg font-bold text-text-primary">Panda-Bande</p>
          <p className="text-xs text-text-muted">CMS Admin</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin Navigation">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-text-secondary hover:bg-bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-text-muted hover:bg-bg-secondary hover:text-text-primary"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Abmelden
          </button>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-border bg-bg-card px-4 py-3 md:hidden">
        <p className="font-heading font-bold text-text-primary">Panda-Bande CMS</p>
        <button type="button" onClick={logout} className="text-sm text-text-muted underline">
          Abmelden
        </button>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-bg-card px-2 py-2 md:hidden" aria-label="Admin Navigation mobil">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
                active ? "bg-primary text-white" : "bg-bg-secondary text-text-secondary"
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function AdminPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary">{title}</h1>
        {description && <p className="mt-1 text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-bg-card p-5 shadow-sm sm:p-6 ${className}`}>
      {title ? <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">{title}</h2> : null}
      {children}
    </div>
  );
}
