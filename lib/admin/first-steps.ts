import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Image,
  Inbox,
  Mail,
  Receipt,
  Settings,
  Star,
  Type,
  Users,
} from "lucide-react";

export interface FirstStepDefinition {
  id: string;
  title: string;
  body: string;
  href: string;
  icon: LucideIcon;
  permission: string;
}

/** Persistent checklist — separate from first-login onboarding wizard. */
export const FIRST_STEPS: FirstStepDefinition[] = [
  {
    id: "content",
    title: "Texte auf der Website ändern",
    body: "Unter Website → Inhalte bearbeitest du Startseite, Über uns und Kontakt. Nach dem Speichern ist die Änderung live.",
    href: "/admin/inhalte",
    icon: Type,
    permission: "website:write",
  },
  {
    id: "gallery",
    title: "Bilder hochladen",
    body: "Unter Website → Galerie lädst du Eventfotos hoch — sie erscheinen öffentlich auf der Website.",
    href: "/admin/galerie",
    icon: Image,
    permission: "gallery:write",
  },
  {
    id: "inquiries",
    title: "Anfragen bearbeiten",
    body: "Neue Kontaktanfragen findest du unter Anfragen. Setze den Status und lege bei Bedarf einen Kunden an.",
    href: "/admin/anfragen",
    icon: Inbox,
    permission: "inquiries:write",
  },
  {
    id: "quotes",
    title: "Angebot erstellen",
    body: "Unter Angebote wählst du einen Kunden, trägst Positionen ein und sendest das PDF per E-Mail.",
    href: "/admin/angebote",
    icon: FileText,
    permission: "quotes:write",
  },
  {
    id: "invoices",
    title: "Rechnung senden",
    body: "Unter Rechnungen erstellst du eine Rechnung aus einem Angebot. PDF öffnen und per E-Mail versenden.",
    href: "/admin/rechnungen",
    icon: Receipt,
    permission: "invoices:write",
  },
  {
    id: "reviews",
    title: "Bewertungen veröffentlichen",
    body: "Neue Bewertungen warten unter Website → Bewertungen auf deine Freigabe. Erst danach sind sie öffentlich sichtbar.",
    href: "/admin/bewertungen",
    icon: Star,
    permission: "reviews:write",
  },
  {
    id: "team",
    title: "Team ändern",
    body: "Unter Website → Team legst du Mitglieder an. Nur aktive Mitglieder erscheinen unter „Über uns“ auf der Website.",
    href: "/admin/team",
    icon: Users,
    permission: "team:write",
  },
  {
    id: "hours",
    title: "Öffnungszeiten ändern",
    body: "Unter Einstellungen → Kontakt & Social Media oder Website → Inhalte (Kontakt). Öffnungszeiten erscheinen im Kontaktbereich.",
    href: "/admin/einstellungen?tab=contact",
    icon: Settings,
    permission: "settings:write",
  },
  {
    id: "email",
    title: "Test-E-Mail senden",
    body: "Unter Einstellungen → E-Mail & Versand kannst du eine Testmail senden. Bei grüner Meldung funktioniert der Versand.",
    href: "/admin/einstellungen?tab=email",
    icon: Mail,
    permission: "settings:system",
  },
];

export const FIRST_STEPS_DONT_DELETE = [
  "Firmendaten und Bankverbindung in den Einstellungen",
  "E-Mail-Vorlagen ohne vorherige Vorschau",
  "Kunden mit verknüpften Angeboten oder Rechnungen",
  "Veröffentlichte Bewertungen ohne Rücksprache",
  "Admin-Benutzer (nur über Benutzer & Rollen verwalten)",
] as const;

export interface FirstStepProgress {
  id: string;
  completed: boolean;
  autoDetected: boolean;
}

export interface FirstStepsResponse {
  steps: Array<FirstStepDefinition & FirstStepProgress>;
  completedCount: number;
  totalCount: number;
  percent: number;
}
