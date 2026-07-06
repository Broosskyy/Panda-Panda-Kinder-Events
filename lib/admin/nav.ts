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

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "overview",
    items: [
      { href: "/admin", label: "Dashboard", iconKey: "Home" },
      { href: "/admin/analytics", label: "Analytics", iconKey: "BarChart3" },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    items: [
      { href: "/admin/kunden", label: "Kunden", iconKey: "Users" },
      { href: "/admin/angebote", label: "Angebote", iconKey: "FileText" },
      { href: "/admin/rechnungen", label: "Rechnungen", iconKey: "Receipt" },
    ],
  },
  {
    id: "website",
    label: "Website",
    items: [
      { href: "/admin/inhalte", label: "Inhalte", iconKey: "Layout", mobileLabel: "Inhalte" },
      { href: "/admin/leistungen", label: "Leistungen", iconKey: "Sparkles" },
      { href: "/admin/galerie", label: "Galerie", iconKey: "Image" },
      { href: "/admin/beitraege", label: "Beiträge", iconKey: "Newspaper" },
      { href: "/admin/faq", label: "FAQ", iconKey: "HelpCircle" },
    ],
  },
  {
    id: "kommunikation",
    label: "Kommunikation",
    items: [
      { href: "/admin/anfragen", label: "Anfragen", iconKey: "Inbox" },
      { href: "/admin/bewertungen", label: "Bewertungen", iconKey: "Star" },
    ],
  },
  {
    id: "settings",
    label: "Verwaltung",
    items: [
      { href: "/admin/team", label: "Team", iconKey: "UserCog" },
      { href: "/admin/einstellungen", label: "Einstellungen", iconKey: "Settings" },
    ],
  },
];

/** Flat list for bottom nav, breadcrumbs, legacy usage */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export const MOBILE_BOTTOM_NAV_HREFS = [
  "/admin",
  "/admin/kunden",
  "/admin/galerie",
  "/admin/anfragen",
] as const;

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isAdminNavGroupActive(pathname: string, group: AdminNavGroup): boolean {
  return group.items.some((item) => isAdminNavActive(pathname, item.href));
}
