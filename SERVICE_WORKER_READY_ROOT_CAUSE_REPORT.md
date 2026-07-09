# Service Worker Ready — Root Cause Report

**Datum:** 2026-07-09  
**Branch:** `cursor/service-worker-ready-root-cause-dab0`  
**Status:** Root Cause identifiziert — **kein Push/VAPID-Fix in diesem Schritt**

---

## Kurzfassung

`navigator.serviceWorker.ready` hängt, obwohl der Admin-Service-Worker **registriert und aktiviert** ist, weil die **kanonische Dokument-URL `/admin` (ohne trailing slash)** in Chrome **keiner** Service-Worker-Registration zugeordnet werden kann.

Die Diagnose prüft mit `getRegistration("/admin/")` (mit Slash) → findet die Registration → „Service Worker registriert = ja“.  
`navigator.serviceWorker.ready` nutzt dagegen die **aktuelle Seiten-URL** (`/admin`) → **keine passende Registration** → Promise bleibt **unbegrenzt pending** (Timeout nach 15 s).

Das ist **kein VAPID-/Push-Problem** und **kein fehlendes `skipWaiting()`/`clients.claim()`**. Es ist ein **URL-Scope-Mismatch** zwischen Next.js-Routing, Manifest `start_url` und SW-Scope.

---

## Beobachtete Symptome (vom Nutzer bestätigt)

| Signal | Wert |
|--------|------|
| `Notification.permission` | `granted` |
| `PushManager` | vorhanden |
| Service Worker registriert | ja |
| `navigator.serviceWorker.ready` | **TIMEOUT nach 15 s** |

---

## Empirische Verifikation (Chrome Headless, Production-Build lokal)

Reproduktion mit `npm run build && PORT=3015 npm run start` und Puppeteer gegen `http://localhost:3015`.

### Auf `/admin` (kanonische URL, ohne trailing slash)

```json
{
  "href": "http://localhost:3015/admin",
  "pathname": "/admin",
  "regSlash": "activated",
  "regNoSlash": null,
  "controller": null,
  "containerReady": "timeout"
}
```

### Auf `/admin/passwort-reset` (Subpfad unter `/admin/`)

```json
{
  "href": "http://localhost:3015/admin/passwort-reset",
  "pathname": "/admin/passwort-reset",
  "containerReady": "resolved",
  "controller": "http://localhost:3015/admin/sw.js"
}
```

### `getRegistration()`-Lookup (entscheidend)

| Client-URL-Argument | Registration gefunden? |
|---------------------|------------------------|
| `/admin` | **nein (null)** |
| `http://localhost:3015/admin` | **nein (null)** |
| `/admin/` | ja |
| `/admin/dashboard` | ja |
| `/admin/anfragen` | ja |

**Folge:** Auf der exakten URL `/admin` resolved `navigator.serviceWorker.ready` **nie**. Auf Admin-Subpfaden resolved es **zuverlässig**, und `navigator.serviceWorker.controller` wird gesetzt.

---

## Antworten auf die 10 Prüfpunkte

### 1. Welche Service Worker werden registriert?

`navigator.serviceWorker.getRegistrations()` liefert **eine** Registration:

| Feld | Wert |
|------|------|
| Script | `/admin/sw.js` |
| Scope | `…/admin/` |
| Active State | `activated` |

Legacy `/admin-sw.js` wird in `public/admin/pwa-capture.js` beim Start explizit deregistriert. Kein zweiter aktiver SW im Test.

### 2. Welcher Scope wird verwendet?

Überall konsistent **`/admin/`** (mit trailing slash):

- `public/admin/pwa-capture.js`: `{ scope: "/admin/" }`
- `lib/admin/pwa-install.ts` → `registerAdminServiceWorker()`
- `lib/admin/push/*.ts` → `register("/admin/sw.js", { scope: "/admin/" })`
- Manifest: `scope: "${origin}/admin/"`

### 3. Liegt der SW unter `/admin` oder `/`?

Der Push-/PWA-Service-Worker liegt unter **`/admin/sw.js`** (nicht im Root).  
Legacy-Datei **`/admin-sw.js`** existiert noch im Repo, wird aber nicht mehr aktiv registriert.

### 4. Wird `skipWaiting()` korrekt verwendet?

**Ja.** In `public/admin/sw.js`:

```javascript
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()),
  );
});
```

Der Worker erreicht im Test `active.state === "activated"` — `skipWaiting()` läuft durch.

### 5. Wird `clients.claim()` korrekt verwendet?

**Ja.** In `public/admin/sw.js`:

```javascript
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
```

Auf Subpfaden (z. B. `/admin/passwort-reset`) wird die Seite nach Aktivierung **kontrolliert**. Auf `/admin` bleibt `controller === null`, weil die Seite **keiner Registration zugeordnet** ist — `claim()` kann einen Client nicht übernehmen, der nicht im Scope hängt.

### 6. Blockiert Next.js die Kontrolle?

**Indirekt ja — durch URL-Normalisierung, nicht durch SW-Blocking.**

| Asset | Verhalten |
|-------|-----------|
| `/admin/sw.js` | 200 OK, `Service-Worker-Allowed: /admin/` |
| `/admin/manifest.webmanifest` | 200 OK |
| `/admin/pwa-capture.js` | **307 Redirect** → `/admin?next=…` (ohne Session) |
| `/admin/` | **308 Redirect** → `/admin` |

**Kritischer Konflikt:**

- Next.js leitet **`/admin/` → `/admin`** (308 Permanent Redirect)
- Manifest `start_url` ist **`${origin}/admin`** (ohne Slash) — `src/app/admin/manifest.webmanifest/route.ts`
- SW-Scope ist **`/admin/`** (mit Slash)
- Chrome `getRegistration("/admin")` → **null**
- Chrome `getRegistration("/admin/")` → Registration gefunden

`/admin/pwa-capture.js` fehlt in `PUBLIC_ADMIN_PWA_PATHS` in `src/middleware.ts` (nur `sw.js`, `manifest`, `admin-sw.js` sind öffentlich). Ohne Session wird das Bootstrap-Skript als HTML-Redirect geladen → frühe SW-Registrierung + Auto-Reload greifen auf der Login-Route nicht.

### 7. Gibt es mehrere Service Worker?

Im Test: **nein** (nur eine Registration für `/admin/sw.js`).  
Im Code existieren zwei Dateien (`public/admin/sw.js`, `public/admin-sw.js`), aber nur ersterer wird registriert; Legacy wird bereinigt.

### 8. Wird der falsche Service Worker verwendet?

**Nein.** Push- und PWA-Code registrieren `/admin/sw.js` mit Scope `/admin/`. Das ist der Worker mit Push-Handlern (`push`, `notificationclick`).

### 9. Wird der Push-SW überhaupt aktiviert?

**Ja.** `reg.active.state === "activated"` auf allen getesteten Admin-Routen, sobald die Registration per `/admin/`-Lookup gefunden wird.

### 10. Warum resolved `navigator.serviceWorker.ready` niemals?

**Root Cause:** Scope-/URL-Mismatch auf der kanonischen Admin-URL.

```
Manifest start_url:     /admin          (ohne /)
Next.js kanonisch:      /admin          (308 von /admin/)
SW registration scope:  /admin/         (mit /)
Diagnose-Lookup:        getRegistration("/admin/")  → gefunden
Browser ready-Lookup:   Dokument-URL /admin         → NICHT gefunden → pending ∞
```

**Zusätzlicher Diagnose-Bias:** `lib/admin/push/debug-state.ts` setzt „registriert = ja“ über `getRegistration("/admin/")`, prüft „ready“ aber über `navigator.serviceWorker.ready` — zwei verschiedene Lookup-Regeln in einer Zeile Diagnose.

Betroffene Stellen (alle warten fälschlich auf `navigator.serviceWorker.ready`):

- `lib/admin/push/debug-state.ts`
- `lib/admin/push/activate-flow.ts`
- `lib/admin/push/client.ts`
- `public/admin/pwa-capture.js` (Zeile 121)

---

## Was es NICHT ist

| Vermutung | Ergebnis |
|-----------|----------|
| VAPID falsch | irrelevant für `ready` |
| `skipWaiting()` fehlt | vorhanden, Worker activated |
| `clients.claim()` fehlt | vorhanden, funktioniert auf Subpfaden |
| SW-Datei blockiert | `/admin/sw.js` erreichbar |
| Mehrere konkurrierende SW | nicht reproduziert |
| `cache.addAll()` blockiert Install | Worker wäre nicht `activated` |

---

## Auswirkung auf Push / PWA

1. **PWA Start von Home Screen:** `start_url = /admin` → `ready` hängt, `controller` bleibt null.
2. **Login-Seite `/admin`:** gleiches Verhalten — Diagnose zeigt „registriert ja, ready nein“.
3. **Authentifizierte Subpfade** (`/admin/dashboard`, …): `ready` kann resolved werden; Push-Technik ist dort grundsätzlich erreichbar.
4. **iOS PWA:** verstärkt das Problem, weil Nutzer oft über `start_url` `/admin` starten und Diagnose/Registrierung dort hängen.

---

## Empfohlene Fix-Richtung (noch nicht umgesetzt)

Erst wenn `navigator.serviceWorker.ready` zuverlässig resolved, wieder Push bearbeiten.

**Option A — URL vereinheitlichen (bevorzugt):**

- Kanonische Admin-URL auf **`/admin/`** (mit trailing slash) umstellen
- Manifest `start_url` → `${origin}/admin/`
- Next.js-Redirect **nicht** von `/admin/` nach `/admin` erzwingen (oder umgekehrt `/admin` → `/admin/`)

**Option B — Scope anpassen:**

- SW mit Scope **`/admin`** registrieren (ohne trailing slash), sofern `Service-Worker-Allowed` das zulässt

**Option C — API korrekt verwenden (zusätzlich):**

- Nicht `navigator.serviceWorker.ready` auf `/admin` erwarten
- Stattdessen explizite Registration holen und auf Aktivierung warten, z. B. `(await getRegistration("/admin/")).ready` oder `statechange` bis `activated`
- Diagnose: getrennt melden — `registered`, `active`, `controlling` (nicht „ready“ als Proxy für „registriert“)

**Nebenfix:**

- `/admin/pwa-capture.js` in `PUBLIC_ADMIN_PWA_PATHS` aufnehmen, damit Bootstrap auch ohne Session läuft

---

## Verifikation nach Fix

```bash
npm run build && PORT=3015 npm run start
# In DevTools auf /admin (und /admin/):
await navigator.serviceWorker.ready   # muss < 1s resolved
navigator.serviceWorker.controller  # darf nach erstem Besuch/Reclaim null sein,
                                    # nach Reload oder auf Subpfad gesetzt
(await navigator.serviceWorker.getRegistration('/admin/')).active.state  # 'activated'
```

Akzeptanzkriterium: Auf **`/admin`** (Manifest-`start_url`) resolved `navigator.serviceWorker.ready` innerhalb weniger Sekunden reproduzierbar.

---

## Geänderte Dateien in diesem Schritt

| Datei | Änderung |
|-------|----------|
| `SERVICE_WORKER_READY_ROOT_CAUSE_REPORT.md` | **Neu** — dieser Report |

**Keine Änderungen** an Push-, VAPID- oder Subscription-Code (wie angewiesen).
