# Panda-Bande — PWA Installations-Anleitung

Panda-Bande kann als Web-App auf dem Smartphone installiert werden („Zum Home-Bildschirm hinzufügen").

---

## Was ist installiert?

- **Name:** Panda-Bande Kinderevents
- **Kurzname:** Panda-Bande
- **Start-URL:** Startseite (`/`)
- **Darstellung:** Vollbild (ohne Browser-Leiste)
- **Farben:** Olivgrün (#52563e) / Cremeweiß (#f4f1ea)

---

## Technische Basis

| Datei | Zweck |
|-------|-------|
| `/manifest.webmanifest` | App-Metadaten |
| `/icons/icon-192.png` | Android Icon |
| `/icons/icon-512.png` | Android Splash |
| `/icons/icon-maskable-512.png` | Android adaptive Icon |
| `/apple-touch-icon.png` | iOS Home-Screen Icon |
| `/favicon.png` | Browser-Tab |

Icons neu generieren:

```bash
npm run generate:pwa-icons
```

---

## Android (Chrome)

1. Website in Chrome öffnen
2. Menü (⋮) → **Zum Startbildschirm hinzufügen** oder **App installieren**
3. Name bestätigen → **Hinzufügen**
4. Icon erscheint auf dem Home-Screen

---

## iOS (Safari)

1. Website in **Safari** öffnen (nicht Chrome)
2. Teilen-Button (□↑) tippen
3. **Zum Home-Bildschirm** wählen
4. Name bestätigen → **Hinzufügen**

---

## Desktop (Chrome / Edge)

1. Adressleiste: Install-Symbol (⊕) oder Menü → **App installieren**
2. Panda-Bande öffnet sich als eigenes Fenster

---

## Hinweise

- **Kein Offline-Modus:** Die App benötigt Internet für Inhalte und Admin.
- **Admin-Bereich:** `/admin` funktioniert in der installierten App, ist aber nicht für PWA-Installation optimiert (robots: noindex).
- **Updates:** Nach Deployment lädt die App beim nächsten Besuch die neue Version.

---

## Für Betreiber: Prüfen

- [ ] Manifest unter `https://ihre-domain.de/manifest.webmanifest` erreichbar
- [ ] Icons laden ohne 404
- [ ] Install-Prompt erscheint (Android Chrome)
- [ ] iOS: Icon und Name korrekt auf Home-Screen

---

## Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| Kein Install-Button | HTTPS erforderlich; Manifest prüfen |
| Falsches Icon | `npm run generate:pwa-icons` ausführen und deployen |
| App öffnet nicht | `start_url: "/"` in manifest.ts prüfen |
