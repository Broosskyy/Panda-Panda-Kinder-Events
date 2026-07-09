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
import { resolveAdminIcon } from "@/lib/admin/icons";
import { AdminIdentityPanel } from "@/components/admin/AdminIdentityPanel";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { lockAdminPwa } from "@/components/admin/AdminPwaRegister";
import { ADMIN_HOME_PATH } from "@/lib/admin/routes";

export { AdminPageHeader, AdminCard, AdminPage } from "@/components/admin/ui/AdminLayout";

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
  const { status, identity, permissions, modules } = useAdminSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const scrollYRef = useRef(0);
  const identityLoading = status === "loading";

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
    await lockAdminPwa();
    window.location.href = ADMIN_HOME_PATH;
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
        <AdminIdentityPanel identity={identity} loading={identityLoading} compact />
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
            <AdminIdentityPanel identity={identity} loading={identityLoading} compact />
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
        {mobileBottomNav.map(({ href, iconKey, mobileLabel, label }) => {
          const Icon = resolveAdminIcon(iconKey);
          const active = isAdminNavActive(pathname, href);
          const badge = badgeForHref(href);
          const displayLabel = mobileLabel ?? label;
          return (
            <Link key={href} href={href} className={`admin-bottom-nav-item ${active ? "admin-bottom-nav-item-active" : ""}`}>
              <span className="relative inline-flex">
                <Icon className="admin-bottom-nav-icon" aria-hidden />
                {badge > 0 ? <span className="admin-bottom-nav-badge">{badge > 9 ? "9+" : badge}</span> : null}
              </span>
              <span className="admin-bottom-nav-label">{displayLabel}</span>
            </Link>
          );
        })}
        <button type="button" className="admin-bottom-nav-item" onClick={() => setDrawerOpen(true)} aria-label="Mehr Navigation">
          <Menu className="admin-bottom-nav-icon" aria-hidden />
          <span className="admin-bottom-nav-label">Mehr</span>
        </button>
      </nav>
    </>
  );
}
