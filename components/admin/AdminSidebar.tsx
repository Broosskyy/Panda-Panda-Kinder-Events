"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import {
  ADMIN_NAV_GROUPS,
  MOBILE_BOTTOM_NAV_HREFS,
  isAdminNavActive,
  type AdminNavGroup,
} from "@/lib/admin/nav";

const MOBILE_BOTTOM_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items).filter((item) =>
  (MOBILE_BOTTOM_NAV_HREFS as readonly string[]).includes(item.href),
);

function NavGroupSection({
  group,
  pathname,
  onNavigate,
}: {
  group: AdminNavGroup;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="admin-nav-group">
      {group.label ? <p className="admin-nav-group-label">{group.label}</p> : null}
      <div className="admin-nav-group-items">
        {group.items.map(({ href, label, icon: Icon, mobileLabel }) => {
          const active = isAdminNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{mobileLabel ?? label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin";
  };

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {ADMIN_NAV_GROUPS.map((group) => (
        <NavGroupSection key={group.id} group={group} pathname={pathname} onNavigate={onNavigate} />
      ))}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="admin-sidebar-desktop" aria-label="Admin Navigation">
        <div className="admin-sidebar-brand">
          <p className="font-heading text-lg font-bold text-text-primary">Panda-Bande</p>
          <p className="text-xs text-text-muted">CMS Admin</p>
        </div>
        <nav className="admin-sidebar-nav">
          <NavContent />
        </nav>
        <div className="admin-sidebar-footer">
          <button type="button" onClick={logout} className="admin-nav-link w-full text-text-muted">
            <LogOut className="h-4 w-4 shrink-0" aria-hidden />
            Abmelden
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="admin-mobile-header md:hidden">
        <button
          type="button"
          className="admin-icon-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Menü öffnen"
          aria-expanded={drawerOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="font-heading text-base font-bold text-text-primary">Panda-Bande</p>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">CMS</p>
        </div>
        <button type="button" onClick={logout} className="admin-icon-btn text-text-muted" aria-label="Abmelden">
          <LogOut className="h-4 w-4" />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="admin-drawer-root md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="admin-drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Menü schließen" />
          <aside className="admin-drawer-panel">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <p className="font-heading font-bold text-text-primary">Navigation</p>
              <button type="button" className="admin-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Schließen">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="admin-sidebar-nav p-3">
              <NavContent onNavigate={() => setDrawerOpen(false)} />
            </nav>
          </aside>
        </div>
      ) : null}

      {/* Mobile bottom navigation */}
      <nav className="admin-bottom-nav md:hidden" aria-label="Schnellnavigation">
        {MOBILE_BOTTOM_NAV.map(({ href, label, icon: Icon, mobileLabel }) => {
          const active = isAdminNavActive(pathname, href);
          const shortLabel = mobileLabel ?? label.split(" ")[0];
          return (
            <Link key={href} href={href} className={`admin-bottom-nav-item ${active ? "admin-bottom-nav-item-active" : ""}`}>
              <Icon className="h-5 w-5" aria-hidden />
              <span>{shortLabel}</span>
            </Link>
          );
        })}
        <button type="button" className="admin-bottom-nav-item" onClick={() => setDrawerOpen(true)} aria-label="Mehr Navigation">
          <Menu className="h-5 w-5" aria-hidden />
          <span>Mehr</span>
        </button>
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
    <div className="admin-page-header">
      <div>
        <h1 className="admin-page-title">{title}</h1>
        {description ? <p className="admin-page-description">{description}</p> : null}
      </div>
      {children ? <div className="admin-page-actions">{children}</div> : null}
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
    <div className={`admin-card ${className}`}>
      {title ? <h2 className="admin-card-title">{title}</h2> : null}
      {children}
    </div>
  );
}
