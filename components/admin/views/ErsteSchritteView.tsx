"use client";

import Link from "next/link";
import {
  BookOpen,
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
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { AdminHelpBlock } from "@/components/admin/ui/AdminHelpBlock";

const STEPS = [
  {
    title: "Texte auf der Website ändern",
    body: "Gehe zu Website → Inhalte. Dort bearbeitest du Startseite, Über uns und Kontakt. Nach dem Speichern ist die Änderung live.",
    href: "/admin/inhalte",
    icon: Type,
  },
  {
    title: "Bilder hochladen",
    body: "Gehe zu Website → Galerie. Lade Eventfotos hoch — sie erscheinen öffentlich auf der Website.",
    href: "/admin/galerie",
    icon: Image,
  },
  {
    title: "Anfragen bearbeiten",
    body: "Neue Kontaktanfragen findest du unter Kommunikation → Anfragen. Setze den Status und lege bei Bedarf einen Kunden an.",
    href: "/admin/anfragen",
    icon: Inbox,
  },
  {
    title: "Angebot erstellen",
    body: "Unter CRM → Angebote wählst du einen Kunden, trägst Positionen ein und sendest das PDF per E-Mail.",
    href: "/admin/angebote",
    icon: FileText,
  },
  {
    title: "Rechnung senden",
    body: "Unter CRM → Rechnungen erstellst du eine Rechnung aus einem Angebot oder bearbeitest sie direkt. PDF öffnen und per E-Mail versenden.",
    href: "/admin/rechnungen",
    icon: Receipt,
  },
  {
    title: "Bewertungen veröffentlichen",
    body: "Neue Bewertungen warten unter Kommunikation → Bewertungen auf deine Freigabe. Erst nach Freigabe sind sie öffentlich sichtbar.",
    href: "/admin/bewertungen",
    icon: Star,
  },
  {
    title: "Team ändern",
    body: "Unter Website → Team legst du Mitglieder an. Nur aktive Mitglieder erscheinen unter „Über uns“ auf der Website.",
    href: "/admin/team",
    icon: Users,
  },
  {
    title: "Öffnungszeiten ändern",
    body: "Gehe zu Einstellungen → Unternehmensdaten oder Website → Inhalte (Kontakt). Öffnungszeiten erscheinen im Kontaktbereich.",
    href: "/admin/einstellungen",
    icon: Settings,
  },
  {
    title: "Test-E-Mail senden",
    body: "Unter Einstellungen → E-Mail kannst du eine Testmail senden. Bei grüner Meldung funktioniert der Versand.",
    href: "/admin/einstellungen?tab=email",
    icon: Mail,
  },
] as const;

const DONT_DELETE = [
  "Firmendaten und Bankverbindung in den Einstellungen",
  "E-Mail-Vorlagen ohne vorherige Vorschau",
  "Kunden mit verknüpften Angeboten oder Rechnungen",
  "Veröffentlichte Bewertungen ohne Rücksprache",
  "Admin-Benutzer (nur über Benutzer & Rollen verwalten)",
];

export function ErsteSchritteView() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Erste Schritte"
        description="Willkommen, Samira! Hier findest du die wichtigsten Aufgaben — Schritt für Schritt, ohne technisches Vorwissen."
        whereVisible="Nur hier im Admin — Besucher sehen diese Seite nicht."
      />

      <AdminHelpBlock title="So funktioniert der Admin" variant="tip">
        <p className="text-sm leading-relaxed">
          Alles, was du hier speicherst, wird entweder <strong>auf der Website angezeigt</strong> oder ist{" "}
          <strong>nur intern</strong> (z. B. Kunden, Angebote, Notizen). Grüne Meldungen bedeuten: Erfolgreich
          gespeichert oder gesendet.
        </p>
      </AdminHelpBlock>

      <section>
        <h2 className="admin-dashboard-section-title mb-4">Deine wichtigsten Aufgaben</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Link key={step.href} href={step.href} className="admin-card block transition-colors hover:border-primary/30">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-text-primary">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{step.body}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <AdminCard title="Was du besser nicht löschen solltest">
        <ul className="list-inside list-disc space-y-2 text-sm text-text-secondary">
          {DONT_DELETE.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </AdminCard>

      <AdminCard title="Farben & Status">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="inline-block rounded-full bg-[#4a7c59] px-2 py-0.5 text-xs font-semibold text-white">Grün</span>{" "}
            — Veröffentlicht, gespeichert, erfolgreich
          </p>
          <p>
            <span className="inline-block rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white">Gelb</span>{" "}
            — Entwurf, wartet auf Prüfung
          </p>
          <p>
            <span className="inline-block rounded-full bg-accent-heart px-2 py-0.5 text-xs font-semibold text-white">Rot</span>{" "}
            — Fehler oder Aufmerksamkeit nötig
          </p>
          <p>
            <span className="inline-block rounded-full bg-text-muted px-2 py-0.5 text-xs font-semibold text-white">Grau</span>{" "}
            — Intern oder archiviert
          </p>
        </div>
      </AdminCard>

      <AdminHelpBlock title="Ausführliche Anleitung" variant="info">
        <p className="text-sm">
          Die Datei <strong>SAMIRA_ADMIN_GUIDE.md</strong> im Projekt enthält eine vollständige Schritt-für-Schritt-Anleitung
          zum Ausdrucken oder Nachschlagen.
        </p>
        <p className="mt-2 text-sm text-text-muted">
          <BookOpen className="mr-1 inline h-4 w-4" aria-hidden />
          Bei Fragen: zuerst Dashboard → Erste Schritte, dann die jeweilige Hilfebox auf der Seite.
        </p>
      </AdminHelpBlock>
    </div>
  );
}
