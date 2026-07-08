import type { DashboardQuickActionItem } from "@/lib/admin/dashboard-v2/types";

export const DASHBOARD_V2_QUICK_ACTIONS: DashboardQuickActionItem[] = [
  { id: "inquiry", href: "/admin/anfragen", label: "Neue Anfrage", iconKey: "Inbox", permission: "inquiries:write" },
  { id: "customer", href: "/admin/kunden", label: "Kunde anlegen", iconKey: "Users", permission: "customers:write" },
  { id: "quote", href: "/admin/angebote", label: "Angebot erstellen", iconKey: "FileText", permission: "quotes:write" },
  { id: "invoice", href: "/admin/rechnungen", label: "Rechnung erstellen", iconKey: "Receipt", permission: "invoices:write" },
  { id: "gallery", href: "/admin/galerie", label: "Galerie öffnen", iconKey: "Image", permission: "gallery:write" },
  { id: "website", href: "/admin/inhalte", label: "Website bearbeiten", iconKey: "Layout", permission: "website:write" },
];

export const DASHBOARD_V2_TODAY_CARD_IDS = [
  "inquiries-new",
  "invoices-open",
  "reviews-pending",
  "customers-leads",
  "system-warnings",
] as const;
