import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  FileText,
  HelpCircle,
  Home,
  Image,
  Inbox,
  Layout,
  Newspaper,
  Receipt,
  Settings,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
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
      { href: "/admin", label: "Dashboard", icon: Home },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    items: [
      { href: "/admin/kunden", label: "Kunden", icon: Users },
      { href: "/admin/angebote", label: "Angebote", icon: FileText },
      { href: "/admin/rechnungen", label: "Rechnungen", icon: Receipt },
    ],
  },
  {
    id: "website",
    label: "Website",
    items: [
      { href: "/admin/inhalte", label: "Inhalte", icon: Layout, mobileLabel: "Inhalte" },
      { href: "/admin/leistungen", label: "Leistungen", icon: Sparkles },
      { href: "/admin/galerie", label: "Galerie", icon: Image },
      { href: "/admin/beitraege", label: "Beiträge", icon: Newspaper },
      { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
  {
    id: "kommunikation",
    label: "Kommunikation",
    items: [
      { href: "/admin/anfragen", label: "Anfragen", icon: Inbox },
      { href: "/admin/bewertungen", label: "Bewertungen", icon: Star },
    ],
  },
  {
    id: "settings",
    items: [{ href: "/admin/einstellungen", label: "Einstellungen", icon: Settings }],
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
