# PWA INSTALL PROMPT DEBUG + REAL FIX REPORT

**Datum:** 8. Juli 2026  
**Branch:** `cursor/pwa-install-prompt-fix-dab0`  
**Ziel:** Echten Grund für fehlenden `beforeinstallprompt` finden und Install-Flow stabil reparieren.

---

## PWA INSTALL STATUS

**Native Install Prompt wird von Chrome aktuell nicht immer geliefert, aber Diagnose + manuelle Installation funktionieren jetzt korrekt.**

Wenn Chrome den Prompt liefert, wird er zuverlässig abgefangen, gespeichert und über den Button ausgelöst. Wenn Chrome keinen Prompt liefert (Engagement-Heuristik, vorherige Ablehnung, In-App-Browser), zeigt die UI eine **konkrete Diagnose** und **nie einen toten Button**.

---

## 1. Geprüfte Dateien

| Datei | Rolle |
|-------|-------|
| `src/app/admin/layout.tsx` | Admin-Layout, Manifest-Link, Script-Load |
| `src/app/admin/manifest.webmanifest/route.ts` | Admin-Manifest |
| `public/admin/pwa-capture.js` | **NEU** — synchrones Early-Capture |
| `public/admin/sw.js` | Service Worker (primär) |
| `public/admin-sw.js` | Service Worker (Fallback) |
| `components/admin/AdminPwaEarlyCapture.tsx` | React-Backup-Listener + SW-Registrierung |
| `components/admin/AdminPwaProvider.tsx` | State, Install-Flow, Debug-Status |
| `components/admin/AdminPwaInstallPanel.tsx` | Install-Karte UI |
| `components/admin/AdminPwaInstallHelpSheet.tsx` | Installationshilfe-Modal |
| `components/admin/dashboard/DashboardPwaInstallCard.tsx` | Dashboard-Karte |
| `components/admin/AdminAppSettingsCard.tsx` | Einstellungen-Install-Panel |
| `lib/admin/pwa-install.ts` | Probe, Debug, Reset, SW-Registrierung |
| `src/app/globals.css` | Help-Sheet Styles |
| `scripts/admin-pwa-install-real-fix-test.mjs` | Smoke-Tests |

**Manifest und Service Worker wurden nicht umgebaut** — beide waren bereits korrekt konfiguriert.

---

## 2. Warum `beforeinstallprompt` bisher nicht verfügbar war

### Hauptursache (Code-Timing)

`beforeinstallprompt` wird von Chrome **sehr früh** beim Laden der Seite gefeuert — oft **bevor React hydratisiert** und `useEffect` in `AdminPwaEarlyCapture` / `AdminPwaProvider` läuft.

Der bisherige Flow:
1. Seite lädt → Chrome prüft PWA-Kriterien
2. Chrome feuert `beforeinstallprompt` (einmalig pro Session)
3. **Kein Listener registriert** (React noch nicht ready)
4. Event geht verloren
5. Diagnose zeigt: Manifest OK, SW OK, Icons OK — aber **Install-Prompt fehlt**

Das erklärt exakt das beobachtete Verhalten: alle technischen Kriterien grün, Status „Install Prompt noch nicht verfügbar“.

### Sekundäre Ursachen (Browser-Verhalten, nicht Code-Bug)

Auch mit korrektem Code kann Chrome den Prompt verweigern:
- Engagement-Heuristik (erst nach wiederholtem Besuch)
- Prompt zuvor vom Nutzer abgelehnt
- In-App-Browser (Instagram, Facebook WebView)
- App bereits installiert / standalone

---

## 3. Problem-Kategorie

| Anteil | Kategorie |
|--------|-----------|
| **Primär** | **Code** — Listener zu spät registriert |
| Sekundär | Browser-Verhalten — Chrome liefert Prompt nicht immer |
| Nein | Manifest/Icons/Scope — waren korrekt |
| Nein | Service Worker — war registriert und aktiv |

---

## 4. Konkrete Änderungen

### A) Synchrones Early-Capture (`public/admin/pwa-capture.js`)

Neues Script, geladen via `next/script` mit `strategy="beforeInteractive"` in `src/app/admin/layout.tsx`:

```javascript
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  window.__pbPwaDeferredPrompt = e;
  window.__pbPwaPromptFired = true;
  window.dispatchEvent(new CustomEvent("pb-pwa-prompt-available"));
}, { capture: true });
```

Läuft **vor React-Hydration** — fängt das Event ab, bevor es verloren geht.

### B) Stabiler Prompt-Speicher (`AdminPwaProvider`)

- `deferredRef` + `window.__pbPwaDeferredPrompt` — überlebt Re-Renders
- Listener auf `pb-pwa-prompt-available` Custom-Event
- `install()` nutzt Ref + Window-Fallback
- `userChoice` wird ausgewertet (accepted/dismissed)

### C) Debug-Status (`lib/admin/pwa-install.ts`)

Neue Funktionen:
- `buildPwaDebugStatus()` — 14 technische Felder
- `detectPwaInstallCause()` — automatische Ursachen A–F
- `resetPwaInstallHints()` — nur PWA-localStorage/sessionStorage
- `detectBrowserProfile()` — Chrome Android/Desktop, iOS, In-App-Browser

### D) Install-Button nie tot (`AdminPwaInstallPanel`)

- Primär-Button: **„Admin-App installieren“** — öffnet nativen Prompt wenn vorhanden
- Ohne Prompt: öffnet Hilfe mit konkreter Diagnose
- Sekundär: Installationshilfe, Status prüfen, Hinweis zurücksetzen
- Ausklappbare technische Diagnose nach Status-Check

### E) Installationshilfe-Modal

- Solider Backdrop (`--admin-overlay-backdrop`)
- Opake Panel-Hintergrundfarbe + Textfarbe
- Diagnose-Block mit allen Debug-Feldern
- Nativer Install-Button im Modal wenn `canInstall`

### F) Reset-Aktion

„Installationshinweis zurücksetzen“ löscht nur:
- `pb-admin-pwa-install-hidden`
- `pb-admin-pwa-install-dismissed`
- `pb-admin-pwa-installed` (stale flag)
- `pb-admin-pwa-card-closed` (session)
- `pb-admin-pwa-sw-reload-done` (session)

---

## 5. Neuer Install-Flow

```
1. pwa-capture.js lädt (beforeInteractive)
   → Listener registriert
   
2. Chrome feuert beforeinstallprompt
   → event.preventDefault()
   → window.__pbPwaDeferredPrompt = event
   → CustomEvent "pb-pwa-prompt-available"

3. AdminPwaProvider mounted (nach Login)
   → takeEarlyCapturedPrompt() liest gespeichertes Event
   → canInstall = true

4. Nutzer klickt „Admin-App installieren"
   → deferredPrompt.prompt()
   → userChoice auswerten
   → accepted: Erfolg / dismissed: Hinweis

5. Falls kein Prompt:
   → detectPwaInstallCause() erklärt warum
   → Installationshilfe mit manueller Anleitung
```

---

## 6. Chrome Android — erwartetes Verhalten

| Situation | UI zeigt |
|-----------|----------|
| Prompt verfügbar | „Admin-App installieren" → nativer Dialog |
| Kriterien OK, kein Prompt | „Chrome hat aktuell keinen nativen Installationsdialog bereitgestellt…" + manuelle Anleitung |
| In-App-Browser | „Bitte in Chrome öffnen" |
| Bereits installiert | „Bereits installiert" |
| SW kontrolliert nicht | „Seite neu laden" |

Technische Diagnose nach „Installationsstatus prüfen":
- `beforeinstallprompt gefeuert: ja/nein`
- `deferredPrompt gespeichert: ja/nein`
- Browser-Profil, Route, scope, start_url

---

## 7. Wenn Chrome weiterhin keinen Prompt liefert

Das ist **kein Code-Fehler**, sondern Chromes Installability-Policy:

1. UI zeigt ehrlich: technische Kriterien erfüllt / nicht erfüllt
2. Konkrete Ursache (Engagement, Ablehnung, In-App-Browser)
3. Manuelle Anleitung: Chrome-Menü → „App installieren"
4. Button „Installationshinweis zurücksetzen" für stale Flags
5. Seite neu laden empfohlen

---

## 8. Tests

| Test | Ergebnis |
|------|----------|
| `npm run lint` | ✅ |
| `npm run typecheck` | ✅ |
| `npm run build` | ✅ |
| `node scripts/admin-pwa-install-real-fix-test.mjs` | ✅ 19/19 |
| `npm run test:security` | ✅ 36/36 |

---

## 9. Manuelle Prüfung empfohlen

Auf echtem Gerät testen:

1. **Chrome Android:** Admin öffnen → Dashboard → Install-Karte → Status prüfen → Debug-Diagnose → Button klicken
2. **Chrome Desktop:** gleicher Flow, ggf. Install-Icon in Adressleiste
3. **Nach Prompt-Ablehnung:** Diagnose soll „temporär blockiert" zeigen + manuelle Anleitung
4. **In Instagram In-App-Browser:** Diagnose „In Chrome öffnen"
5. **Nach Installation:** Karte zeigt „Bereits installiert"

---

## Zusammenfassung

| Frage | Antwort |
|-------|---------|
| Warum fehlte der Prompt? | Listener registriert zu spät (nach React useEffect) |
| Manifest/SW falsch? | Nein — waren OK |
| Ist es jetzt gefixt? | Ja — synchrones Early-Capture + stabiler State |
| Funktioniert Prompt immer? | Nein — Chrome entscheidet; UI diagnostiziert ehrlich |
| Button tot? | Nein — immer Aktion oder Hilfe |

**PWA INSTALL STATUS: Native Install Prompt wird korrekt abgefangen wenn Chrome ihn liefert; Diagnose + manuelle Installation funktionieren korrekt wenn nicht.**
