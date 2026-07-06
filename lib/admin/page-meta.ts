/** Seiten-Metadaten: Titel, Beschreibung, Sichtbarkeit, Quick-Help */

export interface AdminPageMeta {
  title: string;
  description: string;
  whereVisible?: string;
  help: string[];
}

export const ADMIN_PAGE_META = {
  dashboard: {
    title: "Dashboard",
    description: "Überblick über Website, Anfragen, Kunden und letzte Aktivitäten.",
    help: [
      "Sieh auf einen Blick, was Aufmerksamkeit braucht.",
      "Springe per Schnellzugriff zu häufigen Aufgaben.",
      "Prüfe Hinweise zu E-Mail und Analytics.",
    ],
  },
  analytics: {
    title: "Analytics",
    description: "Besucherstatistiken — datenschutzfreundlich, ohne externe Tracking-Pflicht.",
    whereVisible: "Nur hier im Admin — Besucher sehen keine Analytics-Oberfläche.",
    help: [
      "Sieh beliebte Seiten und Besucherzahlen.",
      "Erkenne Trends ohne Google Analytics.",
      "Exportiere Daten bei Bedarf als CSV.",
    ],
  },
  inhalte: {
    title: "Website-Inhalte",
    description: "Texte und Bilder der Startseite bearbeiten — Hero, Über uns, Footer und mehr.",
    whereVisible: "Änderungen erscheinen sofort auf der öffentlichen Website.",
    help: [
      "Passe Überschriften und Texte der Startseite an.",
      "Lade Hero- und About-Bilder hoch.",
      "Speichern aktualisiert die Live-Website.",
    ],
  },
  leistungen: {
    title: "Leistungen",
    description: "Services auf der Website verwalten — Titel, Beschreibung, Preise und Icons.",
    whereVisible: "Sichtbar im Bereich „Leistungen“ auf der Startseite.",
    help: [
      "Leistungen hinzufügen, bearbeiten oder ausblenden.",
      "Reihenfolge bestimmt die Anzeige auf der Website.",
      "Ausgeblendete Leistungen sind für Besucher nicht sichtbar.",
    ],
  },
  galerie: {
    title: "Galerie",
    description: "Eventfotos hochladen und kategorisieren — erscheinen in der öffentlichen Galerie.",
    whereVisible: "Sichtbar unter „Galerie“ auf der Website — Bilder sind anklickbar.",
    help: [
      "Bilder hochladen und Kategorie zuweisen.",
      "Titel und Alt-Text für Barrierefreiheit pflegen.",
      "Ausgeblendete Bilder erscheinen nicht auf der Website.",
    ],
  },
  beitraege: {
    title: "Beiträge",
    description: "Aktuelles veröffentlichen — nur veröffentlichte Beiträge sind öffentlich und in der Sitemap.",
    whereVisible: "Sichtbar unter /aktuelles auf der Website.",
    help: [
      "Neue Beiträge als Entwurf anlegen oder direkt veröffentlichen.",
      "Slug bestimmt die URL des Beitrags.",
      "Entwürfe sind nur im Admin sichtbar.",
    ],
  },
  faq: {
    title: "FAQ",
    description: "Häufig gestellte Fragen pflegen — erscheinen im FAQ-Bereich der Website.",
    whereVisible: "Sichtbar im FAQ-Abschnitt auf der Startseite.",
    help: [
      "Fragen und Antworten hinzufügen oder bearbeiten.",
      "Reihenfolge per Sortierung steuern.",
      "Kurze, verständliche Antworten formulieren.",
    ],
  },
  team: {
    title: "Team",
    description: "Team-Mitglieder für die öffentliche „Über uns“-Seite verwalten.",
    whereVisible: "Sichtbar im Team-Bereich unter „Über uns“ — nicht zu verwechseln mit Admin-Benutzern.",
    help: [
      "Mitglieder anlegen, Bild und Rolle pflegen.",
      "Nur aktive Mitglieder erscheinen auf der Website.",
      "Archivieren statt löschen, wenn du Daten behalten willst.",
    ],
  },
  anfragen: {
    title: "Anfragen",
    description: "Buchungsanfragen von der Website — Status verwalten und Kunden anlegen.",
    whereVisible: "Anfragen kommen vom Kontaktformular auf der Website.",
    help: [
      "Neue Anfragen prüfen und Status setzen.",
      "Aus Anfragen direkt Kunden anlegen.",
      "Notizen für die interne Bearbeitung hinterlegen.",
    ],
  },
  bewertungen: {
    title: "Bewertungen",
    description: "Kundenbewertungen freigeben, beantworten und Eventfotos verwalten.",
    whereVisible: "Freigegebene Bewertungen erscheinen im Bereich „Bewertungen“.",
    help: [
      "Neue Bewertungen prüfen und freigeben.",
      "Als Panda-Bande antworten — sichtbar auf der Website.",
      "Eventfotos nur bei passenden Bewertungen veröffentlichen.",
    ],
  },
  emails: {
    title: "E-Mails",
    description: "E-Mails verfassen, Vorlagen bearbeiten und Versand protokollieren.",
    whereVisible: "Versand nutzt die Einstellungen unter E-Mail & Versand.",
    help: [
      "Einzel-E-Mails an Kunden senden.",
      "Vorlagen für Angebote, Rechnungen und Anfragen anpassen.",
      "Versandhistorie im Protokoll nachverfolgen.",
    ],
  },
  kunden: {
    title: "Kunden",
    description: "Kundenstamm verwalten — Grundlage für Angebote, Rechnungen und E-Mail-Versand.",
    whereVisible: "Kundendaten nur im Admin — nicht öffentlich auf der Website.",
    help: [
      "Kunden manuell anlegen oder aus Anfragen übernehmen.",
      "E-Mail-Adresse für PDF- und Rechnungsversand hinterlegen.",
      "Historie zeigt Angebote, Rechnungen und Aktivitäten.",
    ],
  },
  angebote: {
    title: "Angebote",
    description: "Angebote erstellen, als PDF öffnen, per E-Mail versenden und in Rechnungen umwandeln.",
    whereVisible: "PDFs und E-Mails nutzen Firmendaten aus den Einstellungen.",
    help: [
      "Kunde wählen, Positionen und Preise erfassen.",
      "PDF prüfen, dann per E-Mail versenden.",
      "Bestätigte Angebote in Rechnungen umwandeln.",
    ],
  },
  rechnungen: {
    title: "Rechnungen",
    description: "Rechnungen erstellen und verwalten — Firmendaten werden aus den Einstellungen übernommen.",
    whereVisible: "PDFs enthalten Logo, Bankdaten und Steuerangaben aus Einstellungen.",
    help: [
      "Rechnungen aus Angeboten erzeugen oder Status pflegen.",
      "PDF öffnen und per E-Mail an Kunden senden.",
      "Zahlungsstatus nach Überweisung aktualisieren.",
    ],
  },
  benutzer: {
    title: "Benutzer & Rollen",
    description: "Admin-Zugänge für Login und Dashboard — getrennt vom öffentlichen Team.",
    whereVisible: "Nur für den Admin-Bereich — keine Auswirkung auf die Website.",
    help: [
      "Neue Admin-Benutzer mit Rolle anlegen.",
      "Rollen steuern, wer was bearbeiten darf.",
      "Passwort bei Neuanlage vergeben.",
    ],
  },
  twoFa: {
    title: "Zwei-Faktor-Authentifizierung",
    description: "Zusätzlicher Schutz für deinen Admin-Zugang per Authenticator-App.",
    whereVisible: "Betrifft nur deinen Login — nicht die öffentliche Website.",
    help: [
      "2FA mit Authenticator-App einrichten.",
      "Backup-Codes sicher aufbewahren.",
      "Bei Gerätewechsel neue Codes erzeugen.",
    ],
  },
  sitzungen: {
    title: "Aktive Sitzungen",
    description: "Angemeldete Geräte einsehen und bei Bedarf abmelden.",
    whereVisible: "Nur Sicherheit — keine Website-Auswirkung.",
    help: [
      "Sieh, von welchen Geräten du angemeldet bist.",
      "Verdächtige Sitzungen einzeln beenden.",
      "Nach Passwort-Änderung alte Sitzungen prüfen.",
    ],
  },
  loginHistorie: {
    title: "Login-Historie",
    description: "Protokoll erfolgreicher und fehlgeschlagener Anmeldeversuche.",
    whereVisible: "Nur zur Sicherheitskontrolle im Admin.",
    help: [
      "Verdächtige Login-Versuche erkennen.",
      "Zeitpunkt und IP-Adresse einsehen.",
      "Bei Auffälligkeiten Passwort ändern.",
    ],
  },
  audit: {
    title: "Aktivitätsprotokoll",
    description: "Nachvollziehen, wer im Admin was geändert hat.",
    whereVisible: "Internes Protokoll — nicht öffentlich.",
    help: [
      "Änderungen an Team, Benutzern und Sicherheit verfolgen.",
      "Zeitstempel und Aktionstyp filtern.",
      "Bei Unklarheiten Verantwortliche identifizieren.",
    ],
  },
  einstellungen: {
    title: "Einstellungen",
    description: "Zentrale Steuerung für Firma, Branding, E-Mail, Rechnungen, SEO und Rechtliches.",
    whereVisible: "Wirkt auf Website, PDFs, E-Mails und Systemstatus.",
    help: [
      "Firmendaten für Rechnungen und PDFs pflegen.",
      "Branding, Logo und Favicon anpassen.",
      "E-Mail-Versand und Domain-Status prüfen.",
    ],
  },
} as const satisfies Record<string, AdminPageMeta>;

export type AdminPageId = keyof typeof ADMIN_PAGE_META;

export const ADMIN_EMPTY_STATES = {
  invoices: {
    title: "Noch keine Rechnungen vorhanden.",
    description: "Erstelle deine erste Rechnung aus einem bestätigten Angebot.",
    actionLabel: "Zu Angeboten",
    actionHref: "/admin/angebote",
  },
  quotes: {
    title: "Noch keine Angebote vorhanden.",
    description: "Erstelle jetzt dein erstes Angebot für einen Kunden.",
    actionLabel: "Angebot erstellen",
  },
  customers: {
    title: "Noch keine Kunden angelegt.",
    description: "Lege Kunden manuell an oder erstelle sie aus einer Anfrage.",
    actionLabel: "Kunde anlegen",
  },
  gallery: {
    title: "Noch keine Galeriebilder.",
    description: "Lade Eventfotos hoch — sie erscheinen in der öffentlichen Galerie.",
    actionLabel: "Bild hochladen",
  },
  reviews: {
    title: "Noch keine Bewertungen.",
    description: "Neue Bewertungen von der Website erscheinen hier zur Freigabe.",
    actionLabel: "Website öffnen",
    actionHref: "/#bewertungen",
  },
  posts: {
    title: "Noch keine Beiträge.",
    description: "Veröffentliche Neuigkeiten unter „Aktuelles“ auf der Website.",
    actionLabel: "Beitrag erstellen",
  },
  bookings: {
    title: "Noch keine Anfragen.",
    description: "Sobald Besucher das Kontaktformular nutzen, erscheinen Anfragen hier.",
    actionLabel: "Kontaktformular prüfen",
    actionHref: "/#kontakt",
  },
  faqs: {
    title: "Noch keine FAQ-Einträge.",
    description: "Füge häufig gestellte Fragen für die Website hinzu.",
    actionLabel: "FAQ hinzufügen",
  },
  services: {
    title: "Noch keine Leistungen.",
    description: "Lege Services an, die auf der Startseite angezeigt werden.",
    actionLabel: "Leistung hinzufügen",
  },
  users: {
    title: "Noch keine Admin-Benutzer.",
    description: "Lege den ersten Admin-Zugang für das Team an.",
    actionLabel: "Benutzer anlegen",
  },
  team: {
    title: "Noch keine Team-Mitglieder.",
    description: "Füge Mitglieder hinzu — sie erscheinen unter „Über uns“ auf der Website.",
    actionLabel: "Mitglied hinzufügen",
  },
  activity: {
    title: "Noch keine Aktivitäten.",
    description: "Sobald Anfragen, Bewertungen oder Beiträge eingehen, siehst du sie hier.",
  },
  emailLogs: {
    title: "Noch keine E-Mails versendet.",
    description: "Versendete E-Mails aus Angeboten, Rechnungen und dem Composer erscheinen hier.",
  },
} as const;
