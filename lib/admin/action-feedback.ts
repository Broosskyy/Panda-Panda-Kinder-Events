export type ActionFeedbackStatus = "success" | "error" | "warning";

export interface ActionResultPayload {
  title: string;
  message: string;
  status: ActionFeedbackStatus;
  details?: string;
  primaryLabel?: string;
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export interface ActionConfirmPayload {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  audited?: boolean;
}

export interface RunAdminActionOptions<T> {
  action: () => Promise<T>;
  success: ActionResultPayload | ((result: T) => ActionResultPayload);
  error?: (error: unknown) => ActionResultPayload;
  silent?: boolean;
}

export const ACTION_RESULTS = {
  inviteSent: (email?: string): ActionResultPayload => ({
    title: "Einladung versendet",
    message: email
      ? `Die Einladung an ${email} wurde erstellt.`
      : "Die Einladung wurde erfolgreich erstellt.",
    status: "success",
  }),
  inviteResent: (): ActionResultPayload => ({
    title: "Einladung erneut gesendet",
    message: "Die Einladungs-E-Mail wurde erneut versendet.",
    status: "success",
  }),
  inviteRevoked: (): ActionResultPayload => ({
    title: "Einladung widerrufen",
    message: "Die Einladung ist nicht mehr gültig.",
    status: "warning",
  }),
  linkCopied: (): ActionResultPayload => ({
    title: "Link kopiert",
    message: "Der Link wurde in die Zwischenablage kopiert.",
    status: "success",
  }),
  userCreated: (): ActionResultPayload => ({
    title: "Benutzer erstellt",
    message: "Der Benutzer wurde erfolgreich angelegt.",
    status: "success",
  }),
  userSaved: (): ActionResultPayload => ({
    title: "Benutzer gespeichert",
    message: "Die Benutzerdaten wurden aktualisiert.",
    status: "success",
  }),
  userDeleted: (): ActionResultPayload => ({
    title: "Benutzer gelöscht",
    message: "Der Benutzer wurde dauerhaft entfernt.",
    status: "success",
  }),
  userDeactivated: (): ActionResultPayload => ({
    title: "Benutzer deaktiviert",
    message: "Der Benutzer kann sich nicht mehr anmelden.",
    status: "warning",
  }),
  customerSaved: (): ActionResultPayload => ({
    title: "Kunde gespeichert",
    message: "Die Kundendaten wurden aktualisiert.",
    status: "success",
  }),
  customerArchived: (): ActionResultPayload => ({
    title: "Kunde archiviert",
    message: "Der Kunde wurde archiviert.",
    status: "warning",
  }),
  customerDeleted: (): ActionResultPayload => ({
    title: "Kunde gelöscht",
    message: "Der Kunde wurde dauerhaft entfernt.",
    status: "success",
  }),
  bookingSaved: (): ActionResultPayload => ({
    title: "Anfrage gespeichert",
    message: "Die Anfrage wurde aktualisiert.",
    status: "success",
  }),
  bookingArchived: (): ActionResultPayload => ({
    title: "Anfrage archiviert",
    message: "Die Anfrage wurde archiviert.",
    status: "warning",
  }),
  bookingDeleted: (): ActionResultPayload => ({
    title: "Anfrage gelöscht",
    message: "Die Anfrage wurde dauerhaft entfernt.",
    status: "success",
  }),
  quoteCreated: (): ActionResultPayload => ({
    title: "Angebot erstellt",
    message: "Das Angebot wurde gespeichert.",
    status: "success",
  }),
  quoteSent: (): ActionResultPayload => ({
    title: "Angebot gesendet",
    message: "Das Angebot wurde per E-Mail versendet.",
    status: "success",
  }),
  quoteDeleted: (): ActionResultPayload => ({
    title: "Angebot gelöscht",
    message: "Das Angebot wurde entfernt.",
    status: "success",
  }),
  invoiceCreated: (): ActionResultPayload => ({
    title: "Rechnung erstellt",
    message: "Die Rechnung wurde gespeichert.",
    status: "success",
  }),
  invoiceSent: (): ActionResultPayload => ({
    title: "Rechnung gesendet",
    message: "Die Rechnung wurde per E-Mail versendet.",
    status: "success",
  }),
  invoiceCancelled: (): ActionResultPayload => ({
    title: "Rechnung storniert",
    message: "Die Rechnung wurde storniert.",
    status: "warning",
  }),
  invoiceDeleted: (): ActionResultPayload => ({
    title: "Rechnung gelöscht",
    message: "Die Rechnung wurde entfernt.",
    status: "success",
  }),
  reviewPublished: (): ActionResultPayload => ({
    title: "Bewertung freigegeben",
    message: "Die Bewertung ist jetzt öffentlich sichtbar.",
    status: "success",
  }),
  reviewReplied: (): ActionResultPayload => ({
    title: "Antwort gespeichert",
    message: "Die Antwort auf die Bewertung wurde gespeichert.",
    status: "success",
  }),
  reviewDeleted: (): ActionResultPayload => ({
    title: "Bewertung gelöscht",
    message: "Die Bewertung wurde entfernt.",
    status: "success",
  }),
  galleryUploaded: (): ActionResultPayload => ({
    title: "Bild hochgeladen",
    message: "Das Galeriebild wurde hinzugefügt.",
    status: "success",
  }),
  galleryDeleted: (): ActionResultPayload => ({
    title: "Bild gelöscht",
    message: "Das Galeriebild wurde entfernt.",
    status: "success",
  }),
  teamSaved: (): ActionResultPayload => ({
    title: "Teammitglied gespeichert",
    message: "Die Teamdaten wurden aktualisiert.",
    status: "success",
  }),
  emailTestSent: (): ActionResultPayload => ({
    title: "Test-E-Mail gesendet",
    message: "Die Test-E-Mail wurde versendet.",
    status: "success",
  }),
  settingsSaved: (): ActionResultPayload => ({
    title: "Einstellungen gespeichert",
    message: "Alle Änderungen wurden übernommen.",
    status: "success",
  }),
  passwordChanged: (): ActionResultPayload => ({
    title: "Passwort geändert",
    message: "Das Passwort wurde erfolgreich aktualisiert.",
    status: "success",
  }),
  twoFaReset: (): ActionResultPayload => ({
    title: "2FA zurückgesetzt",
    message: "Die Zwei-Faktor-Authentifizierung wurde zurückgesetzt.",
    status: "warning",
  }),
  twoFaEnabled: (): ActionResultPayload => ({
    title: "2FA eingerichtet",
    message: "Die Zwei-Faktor-Authentifizierung ist aktiv.",
    status: "success",
  }),
  genericError: (message?: string): ActionResultPayload => ({
    title: "Aktion fehlgeschlagen",
    message: message ?? "Bitte versuchen Sie es erneut.",
    status: "error",
    primaryLabel: "Erneut versuchen",
  }),
} as const;

export function friendlyErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === "string" && error.trim()) return error;
  return "Ein unerwarteter Fehler ist aufgetreten.";
}
