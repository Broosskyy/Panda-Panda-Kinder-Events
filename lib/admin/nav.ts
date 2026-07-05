import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  HelpCircle,
  Home,
  Image,
  Inbox,
  Layout,
  Newspaper,
  Settings,
  Sparkles,
  Star,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  mobileLabel?: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/anfragen", label: "Anfragen", icon: Inbox },
  { href: "/admin/bewertungen", label: "Bewertungen", icon: Star },
  { href: "/admin/galerie", label: "Galerie", icon: Image },
  { href: "/admin/beitraege", label: "Beiträge", icon: Newspaper },
  { href: "/admin/leistungen", label: "Leistungen", icon: Sparkles },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/inhalte", label: "Website Inhalte", icon: Layout, mobileLabel: "Inhalte" },
  { href: "/admin/einstellungen", label: "Einstellungen", icon: Settings },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
