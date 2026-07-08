# SAMIRA Handover — Security, Rollen & Audit Report

**Datum:** 8. Juli 2026  
**Ziel:** Panda-Bande morgen an Samira übergeben — ohne technische Kenntnisse, mit klaren Rollen, Schutz vor gefährlichen Aktionen und vollständigem Aktivitätsprotokoll.

---

## Ergebnis: Übergabe-reif

| Bereich | Status |
|---------|--------|
| Rollen & Berechtigungen | ✅ Umgesetzt |
| Super-Admin-Schutz | ✅ Umgesetzt |
| Aktivitätsprotokoll (Audit) | ✅ Erweitert |
| Module ein/aus | ✅ Umgesetzt |
| Samira-freundliche Texte | ✅ Erweitert |
| Build (lint / typecheck / build) | ✅ Grün |

---

## 1. Rollen & Berechtigungen

### Rollen für Samira (deutsche Bezeichnungen)

| Rolle in der Oberfläche | Technischer Slug | Kurzbeschreibung |
|-------------------------|------------------|------------------|
| **Super Admin** | `administrator` | Alles erlaubt — Benutzer, Module, Domain, Backup |
| **Admin** | `manager` | Inhalte, CRM, Angebote, Rechnungen — keine Systemänderungen |
| **Mitarbeiter** | `employee` | Anfragen bearbeiten, Kunden ansehen — keine Einstellungen |
| **Nur Lesen** | `readonly` | Alles ansehen, nichts ändern |

Zusätzlich vorhanden (für Spezialfälle): Redakteur, Buchhaltung.

### Mitarbeiter-Rechte (verschärft)

Mitarbeiter dürfen nur noch:
- Dashboard ansehen
- Website-Inhalte **lesen**
- CRM **lesen** (Kunden ansehen)
- Anfragen **bearbeiten**

Sie dürfen **nicht**: Rechnungen löschen, Einstellungen ändern, Galerie/FAQ/Team schreiben.

### Neue Benutzer

- Standardrolle beim Anlegen: **Admin** (nicht Super Admin)
- Nur Super Admins dürfen weitere Super Admins anlegen
- Rollenwahl mit verständlicher Erklärung unter dem Dropdown
- Jede Anlage/Änderung wird protokolliert

**Dateien:** `lib/admin/role-descriptions.ts`, `supabase/migrations/20260726_samira_handover_rbac_audit.sql`, `components/admin/views/UsersView.tsx`

---

## 2. Super-Admin-Schutz

Kritische Aktionen erfordern **Passwort-Bestätigung** (oder bei Legacy-Setup: Sicherheits-Checkbox).

Geschützte Aktionen:
- Benutzer löschen
- Rolle ändern
- Domain / E-Mail-Einstellungen ändern (`seo`, `email` in Einstellungen)
- Backup erstellen
- Module aktivieren/deaktivieren
- Rechnung löschen
- Aktivitätsprotokoll exportieren

**Technik:** `lib/auth/critical-action.ts`, `components/admin/CriticalActionModal.tsx`

---

## 3. Aktivitätsprotokoll

### Was wird geloggt?

| Feld | Beschreibung |
|------|--------------|
| Wer | Name, Rolle, User-ID |
| Wann | Zeitstempel |
| Was | Aktion (z. B. `login`, `create`, `module_toggle`) |
| Wo | Bereich (z. B. `auth`, `crm`, `settings_modules`) |
| Vorher / Nachher | JSON-Snapshots (Passwörter redigiert) |
| Ergebnis | Erfolg / Fehler |
| IP / Gerät | Wenn verfügbar |

### Protokollierte Ereignisse (Auswahl)

- Login, Logout, fehlgeschlagener Login
- Anfragen geändert
- Benutzer angelegt / geändert / gelöscht / Rolle geändert
- Einstellungen & Module geändert
- Backup exportiert
- Audit-Export
- Rechnung gelöscht
- (Weitere CRM-Aktionen über bestehendes `logCrmAudit`)

### Admin-Oberfläche

**Sicherheit → Aktivitätsprotokoll** mit:
- Freitext-Suche
- Filter: Bereich, Aktion, Datum
- CSV- und JSON-Export (nur Super Admin, mit Passwort)

**Dateien:** `components/admin/views/AuditView.tsx`, `lib/auth/audit.ts`, `src/app/api/admin/security/audit/`

---

## 4. Module ein/ausschalten

**Einstellungen → Module** (nur Super Admin)

| Modul | Wirkung wenn aus |
|-------|------------------|
| Blog | Kein News-Bereich, `/aktuelles` aus Navigation |
| Galerie | Galerie-Bereich ausgeblendet |
| Bewertungen | Keine Bewertungen auf der Website |
| Team | Kein Team im Über-uns-Bereich |
| FAQ | FAQ-Bereich ausgeblendet |
| Leistungen | Leistungen-Bereich ausgeblendet |
| Angebote / Rechnungen / CRM / E-Mail | Admin-Navigation ohne diese Punkte |
| Analytics | Kein Menüpunkt Besucherstatistik |
| WhatsApp-Button | Kein schwebender WhatsApp-Button |
| Sticky CTA | Keine fixe Anfrage-Leiste |

Öffentliche Navigation und Admin-Menü passen sich automatisch an.

**Dateien:** `lib/cms/modules.ts`, `components/admin/settings/ModulesSettingsPanel.tsx`, `lib/admin/filter-nav.ts`

---

## 5. Samira-Freundlichkeit

- Grüne Erfolgs-Toasts (bereits vorher)
- Erklärboxen auf Modul-Seite, Aktivitätsprotokoll, Benutzer-Anlage
- Keine technischen Fehlermeldungen beim Login
- Rollenübersicht mit Klartext auf der Benutzer-Seite
- „Erste Schritte“-Onboarding (bereits vorher)

**Dokumentation:** `SAMIRA_ADMIN_GUIDE.md` (bestehend)

---

## 6. Build & Qualität

```
npm run lint      ✅
npm run typecheck ✅
npm run build     ✅
```

---

## Manuelle Schritte vor der Übergabe an Samira

1. **Migration ausführen:** `supabase/migrations/20260726_samira_handover_rbac_audit.sql` in Supabase deployen
2. **Samira als Super Admin anlegen** (Benutzer & Rollen → Rolle „Super Admin“)
3. **2FA aktivieren** für Samiras Konto (empfohlen)
4. **Kurz-Demo:** Login → Erste Schritte → Modul testweise aus/ein → Aktivitätsprotokoll zeigen
5. **Legacy-Passwort entfernen**, sobald mindestens ein Admin-Benutzer existiert

---

## Bekannte Grenzen (bewusst klein gehalten)

- Kein vollständiger White-Label-Umbau (wie gewünscht)
- Audit-Logging auf allen API-Routen nicht 100 % uniform — Kernbereiche abgedeckt
- Modul „PWA“ schaltet derzeit primär über CMS-Flag; Manifest bleibt technisch aktiv
- Restore aus Backup ist Export-only (kein Import-UI)

---

## Go / No-Go

**GO für Samira-Übergabe** nach Ausführung der Migration und Anlage von Samiras Super-Admin-Konto.
