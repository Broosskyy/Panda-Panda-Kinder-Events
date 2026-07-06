/** Zentrale Admin-Microcopy für Toasts, Fehler und Bestätigungen */

export const ADMIN_MSG = {
  saveSuccess: "✓ Änderungen erfolgreich gespeichert.",
  saveCmsSuccess: "✓ Website aktualisiert — Änderungen sind live.",
  saveFailed: "❌ Speichern fehlgeschlagen.",

  quoteCreated: "✓ Angebot erstellt.",
  quoteSent: "✓ Angebot per E-Mail versendet.",
  invoiceCreated: "✓ Rechnung erstellt.",
  invoiceSent: "✓ Rechnung per E-Mail versendet.",
  pdfGenerated: "✓ PDF geöffnet.",

  customerSaved: "✓ Kunde gespeichert.",
  customerCreated: "✓ Kunde angelegt.",
  bookingSaved: "✓ Anfrage aktualisiert.",
  statusUpdated: "✓ Status aktualisiert.",

  gallerySaved: "✓ Galerie gespeichert.",
  imageUploaded: "✓ Bild hochgeladen.",
  imageDeleted: "✓ Bild gelöscht.",
  reviewPublished: "✓ Bewertung veröffentlicht.",
  reviewSaved: "✓ Bewertung gespeichert.",
  postCreated: "✓ Beitrag erstellt.",
  postUpdated: "✓ Beitrag aktualisiert.",
  postDeleted: "✓ Beitrag gelöscht.",
  logoUpdated: "✓ Logo aktualisiert.",
  brandingSaved: "✓ Branding gespeichert.",
  emailSent: "✓ E-Mail gesendet.",
  testEmailSent: "✓ Test-E-Mail gesendet.",
  templateSaved: "✓ E-Mail-Vorlage gespeichert.",

  userSaved: "✓ Benutzer gespeichert.",
  teamSaved: "✓ Team-Mitglied gespeichert.",
  teamArchived: "✓ Team-Mitglied archiviert.",
  teamRemoved: "✓ Team-Mitglied entfernt.",
  twoFaEnabled: "✓ Zwei-Faktor-Authentifizierung aktiviert.",
  twoFaDisabled: "✓ Zwei-Faktor-Authentifizierung deaktiviert.",
  sessionRevoked: "✓ Sitzung beendet.",

  uploading: "Bild wird hochgeladen…",
  loading: "Wird geladen…",

  deleteFailed: "❌ Löschen fehlgeschlagen.",
  uploadFailed: "❌ Upload fehlgeschlagen.",
  loadFailed: "❌ Daten konnten nicht geladen werden.",
  genericError: "❌ Ein Fehler ist aufgetreten.",
  sendFailed: "❌ Die E-Mail konnte nicht versendet werden.",
} as const;

export function formatAdminError(
  title: string,
  reason?: string,
  solution?: string,
): string {
  const parts = [`❌ ${title}`];
  if (reason?.trim()) parts.push(`Grund: ${reason.trim()}`);
  if (solution?.trim()) parts.push(`Lösung: ${solution.trim()}`);
  return parts.join("\n");
}

export function formatAdminSuccess(message: string): string {
  return message.startsWith("✓") ? message : `✓ ${message}`;
}

/** Bestätigungsdialoge für gefährliche Aktionen */
export const ADMIN_CONFIRM = {
  deleteImage: "Dieses Galeriebild wird dauerhaft gelöscht und verschwindet von der Website.\n\nFortfahren?",
  deletePost: "Dieser Beitrag wird dauerhaft gelöscht und ist nicht mehr erreichbar.\n\nFortfahren?",
  deleteReview: "Diese Bewertung wird dauerhaft gelöscht.\n\nFortfahren?",
  deleteFaq: "Dieser FAQ-Eintrag wird dauerhaft gelöscht.\n\nFortfahren?",
  deleteService: "Diese Leistung wird dauerhaft gelöscht.\n\nFortfahren?",
  archiveTeam: "Dieses Team-Mitglied wird archiviert und nicht mehr auf der Website angezeigt.\n\nFortfahren?",
  removeTeam: "Dieses Team-Mitglied wird endgültig entfernt.\n\nFortfahren?",
  replaceLogo: "Das aktuelle Logo wird ersetzt. Die Änderung wirkt auf Website, PDFs und E-Mails.\n\nFortfahren?",
  replaceFavicon: "Das Favicon wird ersetzt. Browser-Tabs und PWA-Icons können kurz veraltet wirken.\n\nFortfahren?",
  revokeSession: "Diese Sitzung wird beendet. Das Gerät muss sich neu anmelden.\n\nFortfahren?",
  revokeAllSessions: "Alle anderen Sitzungen werden beendet.\n\nFortfahren?",
} as const;

export function confirmDanger(message: string): boolean {
  return typeof window !== "undefined" ? window.confirm(message) : false;
}
