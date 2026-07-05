# Admin + CRM Final Control Sprint — Report

**Version:** 0.9.0-rc.9  
**Datum:** 2026-07-05  
**Branch:** `cursor/admin-crm-final-e022`

## Ziel

Alles, was für Panda-Bande im Alltag wichtig ist, soll im Admin-Dashboard steuerbar sein — ohne öffentliche Website neu zu designen und ohne bestehende Funktionen zu brechen.

---

## 1. Sidebar / Mobile Menü

| Anforderung | Status |
|-------------|--------|
| Vollständig scrollbar | ✅ Eigener Scroll-Container mit `overflow-y: auto`, `min-height: 0` |
| Kein Zurückspringen | ✅ Body-Lock mit `position: fixed` + Scroll-Position-Restore |
| `height: 100dvh` | ✅ Desktop-Sidebar + Drawer-Panel |
| Hintergrund sperren | ✅ Backdrop + Body-Lock |
| Safe-Area | ✅ `safe-area-inset-top/bottom` im Drawer |
| Untere Menüpunkte sichtbar | ✅ Footer mit Abmelden im Drawer |

**Dateien:** `components/admin/AdminSidebar.tsx`, `src/app/globals.css`

---

## 2. Mobile Bottom Navigation

| Anforderung | Status |
|-------------|--------|
| Höhe 72–80px | ✅ `min-height: 5rem` (80px) |
| Größere Icons | ✅ `1.75rem` (28px) |
| Größerer Text | ✅ `0.75rem` |
| Mehr Padding | ✅ `0.625rem` |
| FAB überdeckt nicht | ✅ FAB bei `6.75rem + safe-area` |

---

## 3. Angebote-Formular

| Anforderung | Status |
|-------------|--------|
| Rabatt (%) / MwSt. (%) beschriftet | ✅ Klare Labels, Standard 0 / 19 |
| Vollständig editierbar | ✅ Text-Inputs mit freier Eingabe |
| Gruppierung | ✅ Kunde, Angebotsdaten, Positionen, Rabatt/Steuern, Hinweise |
| Positionen-Editor | ✅ Bezeichnung, Beschreibung, Menge, Preis, Gesamt, Löschen, Duplizieren |
| Live-Berechnung | ✅ Summenpanel |

**Dateien:** `components/admin/views/QuotesView.tsx`, `components/admin/crm/QuoteLineItemsEditor.tsx`

---

## 4. PDFs

| Anforderung | Status |
|-------------|--------|
| Weniger Weißraum | ✅ Kompakterer Header (72px) |
| Sauberer Kopfbereich | ✅ Logo + Firmendaten + Dokumentinfo |
| Kundendatenblock | ✅ Empfänger-Box |
| Größere Positionstabelle | ✅ 10pt Schrift, Zebra-Zeilen |
| Summenblock | ✅ Rechtsbündig, harmonisch |
| Zahlungsinformationen | ✅ IBAN, BIC, Bank, Verwendungszweck |
| Standardtexte aus Einstellungen | ✅ Angebot/Rechnung/Zahlungshinweis |
| Fußzeile mit Firmendaten | ✅ Adresse, Kontakt, Steuerdaten |

**Datei:** `lib/crm/pdf.ts`

---

## 5. Unternehmensdaten

Neue/erweiterte Felder unter **Einstellungen → Unternehmensdaten**:

- Firmenname, Logo, Straße, PLZ, Ort
- Telefon, E-Mail, Website
- IBAN, BIC, Bankname
- Steuernummer, USt-ID (optional)
- Standard Zahlungsziel, Angebotstext, Rechnungstext, Zahlungshinweis

Alle PDFs und E-Mails nutzen `getBusinessProfile()` mit `formattedAddress`.

**Dateien:** `lib/cms/types.ts`, `lib/crm/company.ts`, `components/admin/views/SettingsView.tsx`

---

## 6. E-Mail-Einstellungen

| Feld | Status |
|------|--------|
| Absendername / Absender-E-Mail | ✅ |
| Reply-To | ✅ |
| Kopie-an-Adresse | ✅ |
| Angebots-Kopie an | ✅ |
| Rechnungs-Kopie an | ✅ |
| Kontaktformular-Empfänger | ✅ |
| Test-E-Mail senden | ✅ |
| Testdomain-Hinweis | ✅ |
| Gewünschte Adressen (info@, kontakt@, …) | ✅ |

Keine hardcodierten Absender — Fallback `onboarding@resend.dev` nur ohne verifizierte Domain.

**Dateien:** `lib/email/sender.ts`, `lib/email.ts`, `components/admin/views/SettingsView.tsx`

---

## 7. Teammitglieder

Neuer Bereich **Admin → Team**:

- Anlegen: Name, E-Mail, Rolle, Aktiv/Inaktiv
- Rollen: Admin, Bearbeiter, Nur Lesen
- Rechte vorbereitet in `lib/admin/roles.ts`
- Migration: `supabase/migrations/20260708_team_members.sql`
- API: `GET/POST/PATCH/DELETE /api/admin/team`
- Globales `ADMIN_PASSWORD` unverändert — Multi-Login folgt später

---

## 8. E-Mail-Domain-Dokumentation

- `docs/EMAIL_DOMAIN_SETUP.md` — Domain, Resend, DNS, Vercel, Dashboard, Test

---

## Regression

| Test | Ergebnis |
|------|----------|
| `npm run build` | ✅ |
| `npm run lint` | ✅ |
| `npm run test:crm` | ✅ |

Manuell zu prüfen (Staging/Produktion):

- Admin Login, CMS speichern, Kunde/Angebot/Rechnung
- PDF öffnen, E-Mail senden, Teammitglied anlegen
- Mobile Sidebar scrollt, Bottom-Nav sauber

---

## Geänderte Dateien (Auswahl)

- `components/admin/AdminSidebar.tsx` — Scroll-Fix, Drawer-Struktur
- `components/admin/views/SettingsView.tsx` — Business + Email erweitert
- `components/admin/views/QuotesView.tsx` — Formular-Gruppierung
- `components/admin/views/TeamView.tsx` — neu
- `lib/cms/types.ts` — Business/Email/Team-Typen
- `lib/crm/pdf.ts` — PDF-Layout
- `lib/email/sender.ts` — Copy-Adressen, Inquiry-Empfänger
- `src/app/globals.css` — Nav, Drawer, Form-Sections
