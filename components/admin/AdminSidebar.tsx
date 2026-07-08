"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { AdminNavBadge, AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { useAdminNotificationsContext } from "@/components/admin/AdminNotificationsProvider";
import { MOBILE_BOTTOM_NAV_HREFS, isAdminNavActive, type AdminNavGroup } from "@/lib/admin/nav";
import { filterAdminNavGroups } from "@/lib/admin/filter-nav";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteModulesSettings } from "@/lib/cms/types";
import { resolveAdminIcon } from "@/lib/admin/icons";
import { AdminPageHelp } from "@/components/admin/ui/AdminHelpBlock";
import { AdminIdentityPanel, type AdminIdentity } from "@/components/admin/AdminIdentityPanel";
import { roleDisplayLabel } from "@/lib/admin/roles";
import type { AdminRoleSlug } from "@/lib/auth/types";

const MOBILE_BOTTOM_NAV_HREFS_SET = new Set<string>(MOBILE_BOTTOM_NAV_HREFS);

function NavGroupSection({
  group,
  pathname,
  onNavigate,
  badgeForHref,
}: {
  group: AdminNavGroup;
  pathname: string;
  onNavigate?: () => void;
  badgeForHref: (href: string) => number;
}) {
  return (
    <div className="admin-nav-group">
      {group.label ? <p className="admin-nav-group-label">{group.label}</p> : null}
      <div className="admin-nav-group-items">
        {group.items.map(({ href, label, iconKey, mobileLabel }) => {
          const Icon = resolveAdminIcon(iconKey);
          const active = isAdminNavActive(pathname, href);
          const badge = badgeForHref(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}
            >
              <Icon className="admin-nav-icon shrink-0" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{mobileLabel ?? label}</span>
              <AdminNavBadge count={badge} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { badgeCounts, markTypeRead } = useAdminNotificationsContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollYRef = useRef(0);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [modules, setModules] = useState<SiteModulesSettings>(DEFAULT_SITE_SETTINGS.modules);
  const [identity, setIdentity] = useState<AdminIdentity | null>(null);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((data) => {
        if (data.permissions) setPermissions(data.permissions);
        if (data.modules) setModules(data.modules);
        if (data.authenticated && data.userId) {
          setIdentity({
            userId: data.userId,
            displayName: data.displayName ?? data.identity?.displayName ?? "",
            email: data.email ?? data.identity?.email ?? "",
            roleSlug: (data.roleSlug ?? data.identity?.roleSlug ?? "readonly") as AdminRoleSlug,
            roleLabel: data.roleLabel ?? data.identity?.roleLabel ?? roleDisplayLabel(data.roleSlug ?? "readonly"),
          });
        }
      })
      .catch(() => undefined);
  }, []);

  const navGroups = useMemo(
    () => filterAdminNavGroups(permissions.length ? permissions : ["dashboard:read"], modules),
    [permissions, modules],
  );

  const mobileBottomNav = useMemo(
    () =>
      navGroups
        .flatMap((g) => g.items)
        .filter((item) => MOBILE_BOTTOM_NAV_HREFS_SET.has(item.href.split("?")[0] ?? item.href)),
    [navGroups],
  );

  const badgeForHref = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/admin/anfragen") return badgeCounts.bookings;
    if (base === "/admin/bewertungen") return badgeCounts.reviews;
    if (base === "/admin/kunden") return badgeCounts.customers;
    if (base === "/admin/emails") return badgeCounts.emails;
    return 0;
  };

  useEffect(() => {
    const base = pathname?.split("?")[0];
    if (base === "/admin/anfragen") markTypeRead("booking");
    if (base === "/admin/bewertungen") markTypeRead("review");
    if (base === "/admin/kunden") markTypeRead("customer");
    if (base === "/admin/emails") markTypeRead("email");
  }, [pathname, markTypeRead]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (drawerOpen) {
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollYRef.current);
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
    };
  }, [drawerOpen]);

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.href = "/admin";
  };

  const NavContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      {navGroups.map((group) => (
        <NavGroupSection
          key={group.id}
          group={group}
          pathname={pathname}
          onNavigate={onNavigate}
          badgeForHref={badgeForHref}
        />
      ))}
    </>
  );

  return (
    <>
      <aside className="admin-sidebar-desktop" aria-label="Admin Navigation">
        <div className="admin-sidebar-brand">
          <Logo context="admin" linked={false} />
          <p className="mt-2 text-xs text-text-muted">Verwaltung</p>
        </div>
        <div className="admin-sidebar-notifications hidden md:flex">
          <AdminNotificationCenter />
        </div>
        <AdminIdentityPanel identity={identity} />
        <nav className="admin-sidebar-nav">
          <NavContent />
        </nav>
        <div className="admin-sidebar-footer">
          <button type="button" onClick={logout} className="admin-nav-link w-full text-text-muted">
            <LogOut className="admin-nav-icon shrink-0" aria-hidden />
            Abmelden
          </button>
        </div>
      </aside>

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
        <div className="flex flex-col items-center">
          <Logo context="admin" linked={false} />
          <p className="mt-1 text-[10px] uppercase tracking-wider text-text-muted">Admin</p>
        </div>
        <AdminNotificationCenter />
      </header>

      {drawerOpen ? (
        <div className="admin-drawer-root md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <button type="button" className="admin-drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Menü schließen" />
          <aside className="admin-drawer-panel">
            <div className="admin-drawer-header">
              <p className="font-heading font-bold text-text-primary">Navigation</p>
              <button type="button" className="admin-icon-btn" onClick={() => setDrawerOpen(false)} aria-label="Schließen">
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminIdentityPanel identity={identity} />
            <nav className="admin-drawer-nav">
              <NavContent onNavigate={() => setDrawerOpen(false)} />
            </nav>
            <div className="admin-drawer-footer">
              <button type="button" onClick={logout} className="admin-nav-link w-full text-text-muted">
                <LogOut className="admin-nav-icon shrink-0" aria-hidden />
                Abmelden
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      <nav className="admin-bottom-nav md:hidden" aria-label="Schnellnavigation">
        {mobileBottomNav.map(({ href, label, iconKey, mobileLabel }) => {
          const Icon = resolveAdminIcon(iconKey);
          const active = isAdminNavActive(pathname, href);
          const badge = badgeForHref(href);
          const displayLabel =
            mobileLabel ??
            (href === "/admin"
              ? "Dashboard"
              : href === "/admin/anfragen"
                ? "Anfragen"
                : href === "/admin/kunden"
                  ? "Kunden"
                  : href === "/admin/angebote"
                    ? "Angebote"
                    : href === "/admin/rechnungen"
                      ? "Rechnungen"
                      : label);
          return (
            <Link key={href} href={href} className={`admin-bottom-nav-item ${active ? "admin-bottom-nav-item-active" : ""}`}>
              <span className="relative">
                <Icon className="admin-bottom-nav-icon" aria-hidden />
                {badge > 0 ? <span className="admin-bottom-nav-badge">{badge > 9 ? "9+" : badge}</span> : null}
              </span>
              <span>{displayLabel}</span>
            </Link>
          );
        })}
        <button type="button" className="admin-bottom-nav-item" onClick={() => setDrawerOpen(true)} aria-label="Mehr Navigation">
          <Menu className="admin-bottom-nav-icon" aria-hidden />
          <span>Mehr</span>
        </button>
      </nav>
    </>
  );
}

export function AdminPageHeader({
  title,
  description,
  whereVisible,
  helpItems,
  children,
}: {
  title: string;
  description?: string;
  whereVisible?: string;
  helpItems?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-page-header-block space-y-4">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{title}</h1>
          {description ? <p className="admin-page-description">{description}</p> : null}
          {whereVisible ? (
            <p className="admin-page-where-visible">
              <span className="font-medium">Sichtbar:</span> {whereVisible}
            </p>
          ) : null}
        </div>
        {children ? <div className="admin-page-actions">{children}</div> : null}
      </div>
      {helpItems?.length ? <AdminPageHelp items={helpItems} /> : null}
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
