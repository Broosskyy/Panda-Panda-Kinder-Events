# Sprint Report — CMS / Admin Dashboard

**Datum:** 2026-07-03  
**Branch:** `cursor/cms-admin-e022`  
**PR:** [#12](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/pull/12)  
**Version:** 0.8.0

---

## Ziel

Die Panda-Bande Website soll vollständig über ein Admin-Dashboard gepflegt werden können — ohne Cursor oder Code. Die öffentliche Website (UI, UX, Responsive, Design) bleibt unverändert.

---

## Ergebnis

| Kriterium | Status |
|-----------|--------|
| Admin Sidebar mit 9 Bereichen | ✅ |
| Dashboard mit Statistiken & Schnellzugriffen | ✅ |
| Website-Inhalte (Hero, Kontakt, Über uns, Footer) | ✅ |
| Galerie mit Supabase Storage | ✅ |
| Bewertungen erweitert (Bilder, Antwort, Verifiziert) | ✅ |
| Anfragen mit Status & Notizen | ✅ |
| Leistungen & FAQ dynamisch | ✅ |
| Beiträge / Aktuelles CMS | ✅ |
| Serverseitige Uploads (kein Service Key im Client) | ✅ |
| SQL-Migration ohne Datenverlust | ✅ |
| CMS_ADMIN_GUIDE.md für Nicht-Techniker | ✅ |
| Öffentliche UI unverändert (v0.7.0 Design) | ✅ |
| Build & Lint | ✅ |

---

## Umgesetzte Änderungen

### Admin Dashboard (`/admin`)

Neue Sidebar-Navigation:

| Bereich | Route |
|---------|-------|
| Dashboard | `/admin` |
| Anfragen | `/admin/anfragen` |
| Bewertungen | `/admin/bewertungen` |
| Galerie | `/admin/galerie` |
| Beiträge | `/admin/beitraege` |
| Leistungen | `/admin/leistungen` |
| FAQ | `/admin/faq` |
| Website Inhalte | `/admin/inhalte` |
| Einstellungen | `/admin/einstellungen` |

UX: große Karten, Toasts, Ladeindikatoren, Suche/Filter, mobil nutzbar.

### Website-Inhalte (`site_settings`)

Bearbeitbar über Admin → Website Inhalte:

- **Hero:** Tagline, Headline, Subtitle, CTA-Texte
- **Kontakt:** Telefon, WhatsApp, E-Mail, Instagram, Einsatzgebiet
- **Über uns:** Name, Texte, Mission, Werte, Bild
- **Footer:** Tagline, Copyright

Fallback auf `config/site.ts`, wenn keine CMS-Daten vorhanden.

### Galerie

- Supabase Storage Bucket: `gallery`
- Upload, Ersetzen, Löschen, Sortieren
- Titel, Kategorie, Sichtbarkeit, Vorschau
- Website lädt Bilder dynamisch

### Bewertungen

**Öffentliches Formular:**
- Name, Event-Art, Sterne, Text
- Optional: Profilbild, Eventfoto (JPG/PNG/WebP, max. 5 MB)

**Admin:**
- Profil- und Eventbild anzeigen
- Antwort schreiben, Verifiziert setzen
- Freigeben, Ablehnen, Löschen

**Website:**
- Profilbild oder Initialen-Avatar
- Eventfoto, Admin-Antwort, Verifiziert-Badge

### Anfragen

- Status: Neu, Kontaktiert, Bestätigt, Abgeschlossen, Abgesagt
- Interne Notizen pro Anfrage

### Leistungen & FAQ

- CRUD, Sortierung, Ein-/Ausblenden
- Website lädt dynamisch mit Fallback auf statische Daten

### Beiträge / Aktuelles

- CMS: Titel, Untertitel, Text, Hero-Bild, Kategorie, Datum, Slug, Veröffentlicht
- Neue Section **Aktuelles** auf der Startseite
- Detailseiten unter `/aktuelles/[slug]`

### Sicherheit

- Admin geschützt durch `ADMIN_PASSWORD`
- Uploads nur serverseitig (`/api/admin/upload`, `/api/reviews` mit FormData)
- Keine Service Keys im Client
- Bildvalidierung: JPG, PNG, WebP, max. 5 MB

### Datenbank

Migration: `supabase/migrations/20260703_cms_v080.sql`

Neue Tabellen: `site_settings`, `cms_services`, `cms_faqs`, `gallery_images`, `cms_posts`  
Erweitert: `reviews` (Bilder, Antwort, verified), `booking_requests` (Notizen, Status cancelled)

### Dokumentation

- `CMS_ADMIN_GUIDE.md` — Schritt-für-Schritt für Nicht-Techniker

---

## Verifikation

| Check | Ergebnis |
|-------|----------|
| `npm run build` | ✅ |
| `npm run lint` | ✅ |
| Kontaktformular unverändert | ✅ |
| Resend / Supabase Integration | ✅ |
| Responsive Design beibehalten | ✅ |
| Öffentliche UI (v0.7.0) | ✅ |

---

## Deployment-Checkliste

1. SQL-Migration in Supabase ausführen
2. Storage-Buckets anlegen: `gallery`, `reviews`, `site-assets` (öffentlich lesbar)
3. `ADMIN_PASSWORD` und Supabase-Env-Variablen prüfen

---

## Fazit

Sprint B macht die Panda-Bande Website zu einem kleinen professionellen CMS. Neue Bilder, Texte, Bewertungen und Inhalte können künftig über `/admin` gepflegt werden — ohne Programmierkenntnisse.

**Nächster Schritt:** PR #12 mergen, Migration & Storage in Supabase einrichten, Admin-Passwort setzen.

---

## Download

| Format | Link |
|--------|------|
| **PDF** | [Sprint-Report-CMS-Admin.pdf herunterladen](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/cursor/cms-admin-e022/public/downloads/sprint-reports/Sprint-Report-CMS-Admin.pdf) |
| **Markdown** | [Sprint-Report-CMS-Admin.md herunterladen](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/cursor/cms-admin-e022/docs/05_ROADMAP/Sprint-Report-CMS-Admin.md) |
| **Admin-Anleitung** | [CMS_ADMIN_GUIDE.md](https://github.com/Broosskyy/Panda-Panda-Kinder-Events/raw/cursor/cms-admin-e022/CMS_ADMIN_GUIDE.md) |
| **Alle Reports** | [Sprint-Reports Übersicht](Sprint-Reports.md) |
