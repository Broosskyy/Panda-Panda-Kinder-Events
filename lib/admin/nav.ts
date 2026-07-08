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
      { href: "/admin", label: "Übersicht", iconKey: "Home" },
      { href: "/admin/erste-schritte", label: "Erste Schritte", iconKey: "BookOpen" },
      { href: "/admin/analytics", label: "Besucherstatistik", iconKey: "BarChart3" },
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
      { href: "/admin/team", label: "Team", iconKey: "UserCog" },
    ],
  },
  {
    id: "kommunikation",
    label: "Kommunikation",
    items: [
      { href: "/admin/anfragen", label: "Anfragen", iconKey: "Inbox" },
      { href: "/admin/bewertungen", label: "Bewertungen", iconKey: "Star" },
      { href: "/admin/emails", label: "E-Mail-Protokoll", iconKey: "Mail" },
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
    id: "security",
    label: "Sicherheit",
    items: [
      { href: "/admin/sicherheit/benutzer", label: "Benutzer & Rollen", iconKey: "Users" },
      { href: "/admin/sicherheit/2fa", label: "Zwei-Faktor-Schutz", iconKey: "Shield" },
      { href: "/admin/sicherheit/sitzungen", label: "Sitzungen", iconKey: "Monitor" },
      { href: "/admin/sicherheit/login-historie", label: "Anmelde-Verlauf", iconKey: "History" },
      { href: "/admin/sicherheit/audit", label: "Aktivitätsprotokoll", iconKey: "ScrollText" },
    ],
  },
  {
    id: "settings",
    label: "Einstellungen",
    items: [
      { href: "/admin/einstellungen", label: "Unternehmensdaten", iconKey: "Settings" },
      { href: "/admin/einstellungen?tab=branding", label: "Branding", iconKey: "Image" },
      { href: "/admin/einstellungen?tab=email", label: "E-Mail", iconKey: "Mail" },
      { href: "/admin/einstellungen?tab=modules", label: "Module", iconKey: "Layout" },
      { href: "/admin/einstellungen?tab=system", label: "System", iconKey: "Cpu" },
    ],
  },
];

/** Flat list for bottom nav, breadcrumbs, legacy usage */
export const ADMIN_NAV: AdminNavItem[] = ADMIN_NAV_GROUPS.flatMap((group) => group.items);

export const MOBILE_BOTTOM_NAV_HREFS = [
  "/admin",
  "/admin/galerie",
  "/admin/anfragen",
  "/admin/kunden",
] as const;

export function isAdminNavActive(pathname: string, href: string): boolean {
  const baseHref = href.split("?")[0] ?? href;
  if (baseHref === "/admin") return pathname === "/admin";
  return pathname === baseHref || pathname.startsWith(`${baseHref}/`);
}

export function isAdminNavGroupActive(pathname: string, group: AdminNavGroup): boolean {
  return group.items.some((item) => isAdminNavActive(pathname, item.href));
}
