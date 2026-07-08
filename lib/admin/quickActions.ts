import { hasPermission } from "@/lib/auth/permissions";

export interface AdminQuickAction {
  href: string;
  label: string;
  iconKey: string;
  description?: string;
  permission: string;
}

export const ADMIN_GLOBAL_QUICK_ACTIONS: AdminQuickAction[] = [
  { href: "/admin/kunden", label: "Kunde anlegen", iconKey: "Users", description: "Neuen Kunden im CRM anlegen", permission: "customers:write" },
  { href: "/admin/angebote", label: "Angebot erstellen", iconKey: "FileText", description: "Angebot für einen Kunden erstellen", permission: "quotes:write" },
  { href: "/admin/rechnungen", label: "Rechnung erstellen", iconKey: "Receipt", description: "Rechnung aus Angebot erzeugen", permission: "invoices:write" },
  { href: "/admin/beitraege", label: "Beitrag erstellen", iconKey: "Newspaper", description: "Neuen Blogbeitrag verfassen", permission: "posts:write" },
  { href: "/admin/galerie", label: "Bild hochladen", iconKey: "Image", description: "Galeriebild hinzufügen", permission: "gallery:write" },
];

export const DASHBOARD_QUICK_ACTIONS: AdminQuickAction[] = [
  { href: "/admin/anfragen", label: "Neue Anfrage öffnen", iconKey: "Inbox", description: "Kontaktformular-Anfragen prüfen", permission: "inquiries:write" },
  { href: "/admin/bewertungen", label: "Bewertungen prüfen", iconKey: "Star", description: "Neue Bewertungen freigeben", permission: "reviews:write" },
  { href: "/admin/galerie", label: "Galerie verwalten", iconKey: "Image", description: "Galeriebilder hochladen", permission: "gallery:write" },
  { href: "/admin/beitraege", label: "Blog öffnen", iconKey: "Newspaper", description: "Beiträge verfassen", permission: "posts:write" },
  { href: "/admin/kunden", label: "CRM öffnen", iconKey: "Users", description: "Kunden verwalten", permission: "crm:read" },
  { href: "/admin/angebote", label: "Angebot erstellen", iconKey: "FileText", permission: "quotes:write" },
];

export function filterQuickActions(
  actions: AdminQuickAction[],
  permissions: string[],
): AdminQuickAction[] {
  return actions.filter((action) => hasPermission(permissions, action.permission));
}
