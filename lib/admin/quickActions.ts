import type { LucideIcon } from "lucide-react";
import { FileText, Image, Inbox, Newspaper, Receipt, Users } from "lucide-react";

export interface AdminQuickAction {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export const ADMIN_GLOBAL_QUICK_ACTIONS: AdminQuickAction[] = [
  { href: "/admin/kunden", label: "Kunde anlegen", icon: Users, description: "Neuen Kunden im CRM anlegen" },
  { href: "/admin/angebote", label: "Angebot erstellen", icon: FileText, description: "Angebot für einen Kunden erstellen" },
  { href: "/admin/rechnungen", label: "Rechnung erstellen", icon: Receipt, description: "Rechnung aus Angebot erzeugen" },
  { href: "/admin/beitraege", label: "Beitrag erstellen", icon: Newspaper, description: "Neuen Blogbeitrag verfassen" },
  { href: "/admin/galerie", label: "Bild hochladen", icon: Image, description: "Galeriebild hinzufügen" },
];

export const DASHBOARD_QUICK_ACTIONS: AdminQuickAction[] = [
  { href: "/admin/anfragen", label: "Neue Anfrage ansehen", icon: Inbox, description: "Kontaktformular-Anfragen prüfen" },
  { href: "/admin/beitraege", label: "Neuer Beitrag", icon: Newspaper },
  { href: "/admin/galerie", label: "Bild hochladen", icon: Image },
  { href: "/admin/kunden", label: "Kunde anlegen", icon: Users },
  { href: "/admin/angebote", label: "Angebot erstellen", icon: FileText },
  { href: "/admin/rechnungen", label: "Rechnung erstellen", icon: Receipt },
];
