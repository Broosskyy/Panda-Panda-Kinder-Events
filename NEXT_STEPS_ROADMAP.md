# Nächste Schritte — Roadmap nach Checkpoint

Priorisierte Liste für den Livegang und danach.

## Phase 1 — Technische Live-Vorbereitung

1. **Supabase:** Alle Migrationen in Produktion ausführen
2. **Vercel:** Env Vars setzen, Deploy von `main`
3. **Admin:** Ersten Benutzer anlegen, 2FA aktivieren, Legacy-Passwort absichern
4. **Backup:** Ersten `export:cms` / `export:crm` Lauf + Storage-Backup
5. **Test:** `FULL_TEST_CHECKLIST.md` in Staging abarbeiten

## Phase 2 — Domain & E-Mail

6. **Domain kaufen** (falls noch nicht geschehen)
7. **Domain mit Vercel verbinden** (DNS A/CNAME)
8. **Resend:** Domain verifizieren (SPF, DKIM)
9. **E-Mail:** Postfächer/Weiterleitungen (info@, kontakt@)
10. **Test:** Anfrageformular + Angebots-Mail in Produktion

## Phase 3 — Sichtbarkeit & Recht

11. **Google Search Console** einrichten
12. **Google Business** Profil
13. **SEO:** Meta-Titel, Beschreibungen finalisieren
14. **Datenschutz/Impressum** anwaltlich prüfen
15. **Cookie-Banner** Consent prüfen

## Phase 4 — Inhalt & Qualität

16. **Echte Texte** und Fotos einpflegen
17. **Team** auf Website vervollständigen
18. **Bewertungen** sammeln und freigeben
19. **Performance:** Bildgrößen, Lighthouse-Check
20. **Mobile** auf echten Geräten testen

## Phase 5 — Livegang & Wartung

21. **Go-Live** kommunizieren
22. **Monitoring:** Vercel Logs, gelegentlich Audit Logs
23. **Monatliches Backup** (DB + Storage + Export)
24. **Changelog** bei Änderungen pflegen
25. **Support-Prozess:** Wer bearbeitet Anfragen?

## Optional (nach Livegang)

- Google Analytics 4 Integration
- Automatische E2E-Tests (Playwright)
- Mehrsprachigkeit
- Online-Zahlung für Rechnungen
- Kundenportal
