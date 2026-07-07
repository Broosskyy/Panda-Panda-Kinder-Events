# FINAL SYSTEM STATUS REPORT

**Datum:** 2026-07-07  
**Branch:** `cursor/fix-system-status-e022`

---

## Ausgangslage

Die E-Mail-Funktion arbeitete bereits korrekt (Test-E-Mails kamen an), aber der Systemstatus zeigte irreführende Meldungen:

- „Fehler“ / „Status unbekannt“, obwohl die Resend-Domain-API nicht lesbar war
- „Keine Domain konfiguriert“, obwohl `NEXT_PUBLIC_SITE_URL` / CMS-Domain vorhanden war
- „Test-E-Mail erfolgreich“ blieb gelb, obwohl Testmails im Protokoll standen
- Dashboard zeigte „Legacy“ / „—“ statt echtem Gesundheitsstatus

---

## Änderungen

### 1. Freundliche API-Meldung statt „Fehler“

Wenn die Resend-Domain-API nicht gelesen werden kann (fehlende Berechtigung, API-Fehler, kein Key):

**Meldung:** „Status konnte nicht automatisch geprüft werden.“  
**Ampel:** Gelb (Hinweis), nicht Rot (Fehler)

Betroffene Dateien:
- `lib/email/resend-domain-check.ts`
- `lib/email/resend-status.ts`
- `lib/admin/system-status.ts`
- `lib/admin/email-system-status.ts`
- `components/admin/email/DomainVerificationBanner.tsx`

### 2. Test-E-Mail automatisch grün

Prüfung im Versandprotokoll auf:
- `template_slug === "test"` **oder**
- Betreff enthält „Test-E-Mail“

Wenn mindestens eine erfolgreiche Testmail gefunden wird → **grün**.

### 3. Domain korrekt anzeigen

Website-Domain nutzt jetzt:
1. `NEXT_PUBLIC_SITE_URL`
2. CMS: `seo.primaryDomain`, `seo.canonicalBaseUrl`, `business.website`
3. Fallback über `resolvePublicSiteUrl()` / `getSiteUrl()`

„Keine Domain konfiguriert“ erscheint nur, wenn wirklich keine URL ermittelbar ist.

### 4. Gesamtstatus berechnet

Neues Modul `lib/admin/status-summary.ts`:

| Funktion | Zweck |
|----------|--------|
| `computeStatusSummary()` | Zählt OK / Hinweise / Kritisch und berechnet `overall` |
| `isInformationalStatusItem()` | Schließt optionale Hinweise aus der Gesamtbewertung aus |
| `softenUnavailableApiLevel()` | API-Prüfungsfehler → Hinweis statt kritisch |

**Gesamtstatus:**
- 🟢 Grün = alles OK
- 🟡 Gelb = nur Hinweise
- 🔴 Rot = kritische Fehler

### 5. Optionale Hinweise verschlechtern Gesamtstatus nicht

Vom Gesamtstatus ausgeschlossen:
- Backup
- Analytics
- Migrationen
- DMARC (optional)
- Empfangs-MX / Receiving (optional)

### 6. Dashboard

`lib/admin/dashboard-stats.ts` nutzt jetzt `getSystemStatus().overall`:

| Wert | Anzeige |
|------|---------|
| `ok` | Alles OK |
| `warn` | Hinweise |
| `error` | Achtung |

Link: **Einstellungen → Systemstatus**

### 7. Laienverständliche Texte

- „Fehler“ → „Kritisch“ (nur bei echten Problemen)
- „Status unbekannt“ → „Automatische Prüfung nicht möglich“
- Klarere Beschreibungen für Domain, Versand und Test-E-Mail

---

## UI-Anpassungen

| Komponente | Änderung |
|------------|----------|
| `SystemSettingsShell` | Gesamtstatus-Banner oben |
| `EmailSystemStatusPanel` | Einheitliche Gesamtstatus-Texte |
| `DomainVerificationBanner` | Hinweistext bei nicht prüfbarer Domain |
| `DashboardView` | Echter Systemstatus statt Legacy |

---

## Verifikation

```bash
npm run lint        # OK (nur bestehende Warnungen)
npm run typecheck   # OK
npm run build       # OK
npm run test:email  # 60 passed
```

---

## Nach Deploy prüfen

1. **Dashboard** → Systemstatus zeigt „Alles OK“ oder „Hinweise“ (nicht „—“)
2. **Einstellungen → Systemstatus** → Gesamtbanner + grüne Test-E-Mail (wenn bereits gesendet)
3. **Einstellungen → E-Mail → Systemstatus** → Kein rotes „Fehler“ bei API-Berechtigungsproblem
4. **Domain-Zeile** → Zeigt `https://pb-kinderevents.de` o. ä., nicht „Keine Domain“

---

## Zusammenfassung

| Anforderung | Status |
|-------------|--------|
| Kein „Fehler“ bei nicht lesbarer Domain-API | ✅ |
| Test-E-Mail grün bei erfolgreichem Versand | ✅ |
| Domain aus Env/CMS korrekt | ✅ |
| Dashboard-Gesamtstatus berechnet | ✅ |
| Optionale Hinweise ohne Status-Verschlechterung | ✅ |
| Laienverständliche Texte | ✅ |
