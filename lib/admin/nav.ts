export interface AdminNavItem {
  href: string;
  label: string;
  iconKey: string;
  mobileLabel?: string;
}

export interface AdminNavGroup {
  id: string;
  label?: string;
  items: AdminNavItem[];
}

/** Flat, practical navigation — no deep nesting. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "main",
    items: [
      { href: "/admin", label: "Dashboard", iconKey: "Home", mobileLabel: "Start" },
      { href: "/admin/anfragen", label: "Anfragen", iconKey: "Inbox", mobileLabel: "Anfragen" },
      { href: "/admin/kunden", label: "Kunden", iconKey: "Users", mobileLabel: "Kunden" },
      { href: "/admin/angebote", label: "Angebote", iconKey: "FileText", mobileLabel: "Angeb." },
      { href: "/admin/rechnungen", label: "Rechnungen", iconKey: "Receipt", mobileLabel: "Rechn." },
    ],
  },
  {
    id: "website",
    label: "Website",
    items: [
      { href: "/admin/inhalte", label: "Inhalte", iconKey: "Layout" },
      { href: "/admin/galerie", label: "Galerie", iconKey: "Image" },
      { href: "/admin/bewertungen", label: "Bewertungen", iconKey: "Star" },
      { href: "/admin/leistungen", label: "Leistungen", iconKey: "Sparkles" },
      { href: "/admin/team", label: "Team", iconKey: "UserCog" },
    ],
  },
  {
    id: "communication",
    items: [
      { href: "/admin/emails", label: "E-Mail", iconKey: "Mail" },
      { href: "/admin/sicherheit/benutzer", label: "Benutzer", iconKey: "Users" },
      { href: "/admin/einstellungen", label: "Einstellungen", iconKey: "Settings" },
    ],
  },
  {
    id: "more",
    label: "Mehr",
    items: [
      { href: "/admin/analytics", label: "Besucherstatistik", iconKey: "BarChart3" },
      { href: "/admin/erste-schritte", label: "Erste Schritte", iconKey: "BookOpen" },
      { href: "/admin/sicherheit/audit", label: "Aktivitätsprotokoll", iconKey: "ScrollText" },
    ],
  },
];

/** Flat list for bottom nav, breadcrumbs, legacy usage */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export const MOBILE_BOTTOM_NAV_HREFS = [
  "/admin",
  "/admin/anfragen",
  "/admin/kunden",
  "/admin/angebote",
  "/admin/rechnungen",
] as const;

export function isAdminNavActive(pathname: string, href: string): boolean {
  const baseHref = href.split("?")[0] ?? href;
  if (baseHref === "/admin") return pathname === "/admin";
  return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
}

export function isAdminNavGroupActive(pathname: string, group: AdminNavGroup): boolean {
  return group.items.some((item) => isAdminNavActive(pathname, item.href));
}
