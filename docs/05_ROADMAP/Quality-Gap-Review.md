# Quality Gap Review — Veröffentlichungsreife

**Stand:** nach Mobile Bugfix Sprint v0.6.0  
**Hinweis:** Nur Analyse — nichts davon wurde in diesem Sprint umgesetzt.

---

## A) Kritisch vor Veröffentlichung

| Thema | Status | Nächster Schritt |
|-------|--------|------------------|
| **Echte Kontaktdaten** | Platzhalter in `site.ts` (`phone`, `email`, `whatsapp`) | Finale Nummern/E-Mail eintragen, `isPlaceholder` entfernen |
| **Impressum** | Platzhaltertext, Musteradresse | Rechtsgültiges Impressum mit echtem Inhaber, Adresse, ggf. USt-IdNr. |
| **Datenschutz** | Platzhalter | DSGVO-konforme Datenschutzerklärung (Formular, Supabase, Resend, Hosting) |
| **AGB** | Platzhalter | AGB für Dienstleistungsvertrag Kinderbetreuung prüfen lassen |
| **Echte Fotos** | Unsplash-Stockbilder in Hero, About, Galerie | Eigene Event-Fotos hochladen, Alt-Texte anpassen |
| **Gründerin / Über uns** | „Lisa Muster", generische Texte | Echter Name, echte Story, Team-Foto |
| **Einsatzgebiet** | „NRW · bundesweit" — Platzhalter | Final definieren und konsistent auf Website |
| **Domain & HTTPS** | `panda-bande-events.de` in Config | Domain registrieren, DNS, SSL, Deployment |
| **Professionelle Absender-Mail** | `hallo@panda-bande-events.de` | E-Mail-Postfach + SPF/DKIM für Resend |
| **Cookie-/Tracking-Hinweis** | Kein Cookie-Banner | Prüfen ob nötig (Analytics, eingebettete Inhalte) |
| **SEO Open Graph Bild** | Fehlt in `layout.tsx` | `og:image` mit Marken-Bild für WhatsApp/Instagram-Vorschau |
| **Formular-Spam-Schutz** | Kein Honeypot/CAPTCHA sichtbar | Rate-Limiting prüfen, ggf. Honeypot oder Turnstile |

---

## B) Wichtig, aber kann nach Launch

| Thema | Status | Nächster Schritt |
|-------|--------|------------------|
| **Echte Bewertungen** | Empty State vorhanden, Demo aus | Erste Kunden um Bewertungen bitten, Admin-Freigabe nutzen |
| **Leistungen & Preise** | Generische Beschreibungen, keine Preise | Finale Leistungstexte, „Preis auf Anfrage" oder Pakete |
| **Google Unternehmensprofil** | Nicht vorbereitet | GBP anlegen, NAP-Daten angleichen |
| **Bildoptimierung** | Unsplash-URLs, kein `next/image` lokal | Eigene Bilder als WebP/AVIF in `/public`, `sizes` optimieren |
| **Lighthouse Mobile** | Nicht gemessen in CI | Lighthouse-Lauf nach Deploy, Performance > 90 anstreben |
| **Admin UX** | Funktional, basic | Mobile-Admin testen, Bulk-Aktionen optional |
| **Instagram-Link** | Vorhanden | Profil-Inhalt mit Website abstimmen |
| **Logo-Datei** | `/assets/logo.png` — Fallback-Text wenn fehlt | Finales Logo in hoher Auflösung bereitstellen |

---

## C) Späteres Upgrade

| Thema | Hinweis |
|-------|---------|
| **PWA** | Kein Manifest/Service Worker — Roadmap V4 |
| **Native App** | Nicht nötig für Launch |
| **Mehrsprachigkeit** | Nur Deutsch aktuell |
| **Blog / Ratgeber** | SEO-Content optional |
| **Online-Buchung mit Kalender** | Aktuell Anfrageformular reicht |
| **Zahlungsintegration** | Nach Bedarf |
| **CRM-Anbindung** | Optional für Skalierung |
| **A/B-Tests / Analytics** | Nach datenschutzrechtlicher Klärung |
| **Erweiterte Galerie** | Video, Kundenstimmen mit Foto |
| **Chatbot** | WhatsApp-FAB reicht vorerst |

---

## Kurzfassung

Die Website ist **technisch und visuell launch-nah**, aber **inhaltlich und rechtlich noch nicht veröffentlichungsreif**. Priorität vor Go-Live: echte Kontaktdaten, Rechtstexte, eigene Fotos/Texte, Domain/Mail-Setup und OG-Bild für Social Sharing.
