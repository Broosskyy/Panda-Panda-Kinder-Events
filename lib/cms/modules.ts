import type { SiteModulesSettings } from "./types";

export type ModuleKey = keyof SiteModulesSettings;

export interface ModuleDefinition {
  key: ModuleKey;
  label: string;
  description: string;
  publicHint: string;
  adminPaths: string[];
  navHrefs: string[];
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    key: "blog",
    label: "Blog / Aktuelles",
    description: "Neuigkeiten und Beiträge auf der Website.",
    publicHint: "Seite /aktuelles und News-Bereich auf der Startseite.",
    adminPaths: ["/admin/beitraege"],
    navHrefs: ["/aktuelles", "#aktuelles"],
  },
  {
    key: "gallery",
    label: "Galerie",
    description: "Fotos von Events auf der Website.",
    publicHint: "Galerie-Bereich und Navigationspunkt „Galerie“.",
    adminPaths: ["/admin/galerie"],
    navHrefs: ["#galerie", "/galerie"],
  },
  {
    key: "reviews",
    label: "Bewertungen",
    description: "Kundenbewertungen und Sterne auf der Website.",
    publicHint: "Bewertungsbereich und Seite /bewertungen.",
    adminPaths: ["/admin/bewertungen"],
    navHrefs: ["#bewertungen", "/bewertungen"],
  },
  {
    key: "team",
    label: "Team",
    description: "Teammitglieder im Über-uns-Bereich.",
    publicHint: "Team-Anzeige im Bereich „Über uns“.",
    adminPaths: ["/admin/team"],
    navHrefs: ["#team", "#ueber-uns"],
  },
  {
    key: "faq",
    label: "FAQ",
    description: "Häufig gestellte Fragen.",
    publicHint: "FAQ-Bereich auf der Startseite.",
    adminPaths: ["/admin/faq"],
    navHrefs: ["#faq"],
  },
  {
    key: "services",
    label: "Leistungen",
    description: "Angebotene Leistungen und Pakete.",
    publicHint: "Leistungen-Bereich auf der Startseite.",
    adminPaths: ["/admin/leistungen"],
    navHrefs: ["#leistungen"],
  },
  {
    key: "quotes",
    label: "Angebote",
    description: "Angebote im Admin und CRM.",
    publicHint: "Nur intern — nicht öffentlich sichtbar.",
    adminPaths: ["/admin/angebote"],
    navHrefs: [],
  },
  {
    key: "invoices",
    label: "Rechnungen",
    description: "Rechnungen im Admin und CRM.",
    publicHint: "Nur intern — nicht öffentlich sichtbar.",
    adminPaths: ["/admin/rechnungen"],
    navHrefs: [],
  },
  {
    key: "crm",
    label: "Kunden / CRM",
    description: "Kundenverwaltung und Anfragen.",
    publicHint: "Kontaktformular bleibt aktiv; Kundenliste nur intern.",
    adminPaths: ["/admin/kunden", "/admin/anfragen"],
    navHrefs: [],
  },
  {
    key: "email",
    label: "E-Mail-System",
    description: "E-Mail-Versand, Vorlagen und Protokoll.",
    publicHint: "Nur intern — E-Mails werden im Hintergrund versendet.",
    adminPaths: ["/admin/emails"],
    navHrefs: [],
  },
  {
    key: "backup",
    label: "Backup",
    description: "Daten-Export als Sicherheitskopie.",
    publicHint: "Nur intern.",
    adminPaths: [],
    navHrefs: [],
  },
  {
    key: "analytics",
    label: "Besucherstatistik",
    description: "Besucherzahlen und Statistiken.",
    publicHint: "Nur intern.",
    adminPaths: ["/admin/analytics"],
    navHrefs: [],
  },
  {
    key: "pwa",
    label: "App-Installation (PWA)",
    description: "Website als App installierbar machen.",
    publicHint: "Installationshinweis für Besucher.",
    adminPaths: [],
    navHrefs: [],
  },
  {
    key: "whatsapp",
    label: "WhatsApp-Button",
    description: "Schwebender WhatsApp-Button auf der Website.",
    publicHint: "Grüner Button unten rechts auf der Website.",
    adminPaths: [],
    navHrefs: [],
  },
  {
    key: "stickyCta",
    label: "Anfrage-Leiste (Sticky)",
    description: "Fixierte Anfrage-Leiste am unteren Bildschirmrand.",
    publicHint: "Leiste am unteren Rand auf Mobilgeräten.",
    adminPaths: [],
    navHrefs: [],
  },
];

export function isModuleEnabled(modules: SiteModulesSettings, key: ModuleKey): boolean {
  return modules[key] !== false;
}

export function adminPathModuleKey(pathname: string): ModuleKey | null {
  const base = pathname.split("?")[0] ?? pathname;
  for (const def of MODULE_DEFINITIONS) {
    if (def.adminPaths.some((p) => base === p || base.startsWith(`${p}/`))) {
      return def.key;
    }
  }
  return null;
}

export function filterAdminNavHref(href: string, modules: SiteModulesSettings): boolean {
  const base = href.split("?")[0] ?? href;
  const mod = adminPathModuleKey(base);
  if (!mod) return true;
  return isModuleEnabled(modules, mod);
}

export function filterPublicNavItems<T extends { href: string }>(items: T[], modules: SiteModulesSettings): T[] {
  return items.filter((item) => {
    const href = item.href.toLowerCase();
    for (const def of MODULE_DEFINITIONS) {
      if (!isModuleEnabled(modules, def.key)) {
        if (def.navHrefs.some((pattern) => href.includes(pattern.replace("#", "")) || href === pattern)) {
          return false;
        }
      }
    }
    return true;
  });
}
