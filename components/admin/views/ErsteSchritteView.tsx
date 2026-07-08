"use client";

import { useMemo } from "react";
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
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { hasPermission } from "@/lib/auth/permissions";

const STEPS = [
  {
    title: "Texte auf der Website ändern",
    body: "Gehe zu Website → Inhalte. Dort bearbeitest du Startseite, Über uns und Kontakt. Nach dem Speichern ist die Änderung live.",
    href: "/admin/inhalte",
    icon: Type,
    permission: "website:write",
  },
  {
    title: "Bilder hochladen",
    body: "Gehe zu Website → Galerie. Lade Eventfotos hoch — sie erscheinen öffentlich auf der Website.",
    href: "/admin/galerie",
    icon: Image,
    permission: "gallery:write",
  },
  {
    title: "Anfragen bearbeiten",
    body: "Neue Kontaktanfragen findest du unter Kommunikation → Anfragen. Setze den Status und lege bei Bedarf einen Kunden an.",
    href: "/admin/anfragen",
    icon: Inbox,
    permission: "inquiries:write",
  },
  {
    title: "Angebot erstellen",
    body: "Unter CRM → Angebote wählst du einen Kunden, trägst Positionen ein und sendest das PDF per E-Mail.",
    href: "/admin/angebote",
    icon: FileText,
    permission: "quotes:write",
  },
  {
    title: "Rechnung senden",
    body: "Unter CRM → Rechnungen erstellst du eine Rechnung aus einem Angebot oder bearbeitest sie direkt. PDF öffnen und per E-Mail versenden.",
    href: "/admin/rechnungen",
    icon: Receipt,
    permission: "invoices:write",
  },
  {
    title: "Bewertungen veröffentlichen",
    body: "Neue Bewertungen warten unter Kommunikation → Bewertungen auf deine Freigabe. Erst nach Freigabe sind sie öffentlich sichtbar.",
    href: "/admin/bewertungen",
    icon: Star,
    permission: "reviews:write",
  },
  {
    title: "Team ändern",
    body: "Unter Website → Team legst du Mitglieder an. Nur aktive Mitglieder erscheinen unter „Über uns“ auf der Website.",
    href: "/admin/team",
    icon: Users,
    permission: "team:write",
  },
  {
    title: "Öffnungszeiten ändern",
    body: "Gehe zu Einstellungen → Unternehmensdaten oder Website → Inhalte (Kontakt). Öffnungszeiten erscheinen im Kontaktbereich.",
    href: "/admin/einstellungen",
    icon: Settings,
    permission: "settings:write",
  },
  {
    title: "Test-E-Mail senden",
    body: "Unter Einstellungen → E-Mail kannst du eine Testmail senden. Bei grüner Meldung funktioniert der Versand.",
    href: "/admin/einstellungen?tab=email",
    icon: Mail,
    permission: "settings:system",
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
  const { status, identity, permissions } = useAdminSession();

  const visibleSteps = useMemo(
    () => STEPS.filter((step) => hasPermission(permissions, step.permission)),
    [permissions],
  );

  const identityReady = status === "ready" && Boolean(identity?.displayName);

  const welcomeName = identity?.displayName ?? "";

  return (
    <div className="space-y-8">
      {!identityReady ? (
        <div className="admin-page-header-block space-y-4 animate-pulse" aria-busy="true" aria-label="Profil wird geladen">
          <div className="h-8 w-48 rounded-lg bg-border" />
          <div className="h-4 w-full max-w-xl rounded bg-border" />
        </div>
      ) : (
        <AdminPageHeader
          title="Erste Schritte"
          description={`Willkommen, ${welcomeName}! Hier findest du die wichtigsten Aufgaben — Schritt für Schritt, ohne technisches Vorwissen.`}
          whereVisible="Nur hier im Admin — Besucher sehen diese Seite nicht."
        />
      )}

      <AdminHelpBlock title="So funktioniert der Admin" variant="tip">
        <p className="text-sm leading-relaxed">
          Alles, was du hier speicherst, wird entweder <strong>auf der Website angezeigt</strong> oder ist{" "}
          <strong>nur intern</strong> (z. B. Kunden, Angebote, Notizen). Grüne Meldungen bedeuten: Erfolgreich
          gespeichert oder gesendet.
        </p>
      </AdminHelpBlock>

      <section>
        <h2 className="admin-dashboard-section-title mb-4">Deine wichtigsten Aufgaben</h2>
        {visibleSteps.length === 0 ? (
          <p className="text-sm text-text-muted">Für deine Rolle sind hier keine Bearbeitungsaufgaben hinterlegt — nutze die Navigation für die Ansicht.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleSteps.map((step) => {
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
        )}
      </section>

      <section>
        <h2 className="admin-dashboard-section-title mb-4">Bitte nicht löschen</h2>
        <AdminCard>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">
            {DONT_DELETE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </AdminCard>
      </section>

      <Link
        href="/admin"
        className="admin-card inline-flex items-center gap-3 border-primary/20 bg-primary/5 transition-colors hover:border-primary/40"
      >
        <BookOpen className="h-5 w-5 text-primary" aria-hidden />
        <span className="font-medium text-text-primary">Zurück zur Übersicht</span>
      </Link>
    </div>
  );
}
