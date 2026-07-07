export interface AdminQuickAction {
  href: string;
  label: string;
  iconKey: string;
  description?: string;
}

export const ADMIN_GLOBAL_QUICK_ACTIONS: AdminQuickAction[] = [
  { href: "/admin/kunden", label: "Kunde anlegen", iconKey: "Users", description: "Neuen Kunden im CRM anlegen" },
  { href: "/admin/angebote", label: "Angebot erstellen", iconKey: "FileText", description: "Angebot für einen Kunden erstellen" },
  { href: "/admin/rechnungen", label: "Rechnung erstellen", iconKey: "Receipt", description: "Rechnung aus Angebot erzeugen" },
  { href: "/admin/beitraege", label: "Beitrag erstellen", iconKey: "Newspaper", description: "Neuen Blogbeitrag verfassen" },
  { href: "/admin/galerie", label: "Bild hochladen", iconKey: "Image", description: "Galeriebild hinzufügen" },
];

export const DASHBOARD_QUICK_ACTIONS: AdminQuickAction[] = [
  { href: "/admin/anfragen", label: "Neue Anfrage öffnen", iconKey: "Inbox", description: "Kontaktformular-Anfragen prüfen" },
  { href: "/admin/bewertungen", label: "Bewertungen prüfen", iconKey: "Star", description: "Neue Bewertungen freigeben" },
  { href: "/admin/galerie", label: "Galerie verwalten", iconKey: "Image", description: "Galeriebilder hochladen" },
  { href: "/admin/beitraege", label: "Blog öffnen", iconKey: "Newspaper", description: "Beiträge verfassen" },
  { href: "/admin/kunden", label: "CRM öffnen", iconKey: "Users", description: "Kunden verwalten" },
  { href: "/admin/angebote", label: "Angebot erstellen", iconKey: "FileText" },
];
