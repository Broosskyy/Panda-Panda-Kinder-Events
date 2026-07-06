# Feature-Übersicht — Panda-Bande v1.0-checkpoint

| Feature | Status | Beschreibung | Code | Admin | DB-Tabellen | Risiko | Nächste Schritte |
|---------|--------|--------------|------|-------|-------------|--------|------------------|
| Website | Fertig | Öffentliche Startseite, CMS-gesteuert | `src/app/page.tsx`, `components/sections/` | Inhalte, Leistungen, … | `site_settings`, `cms_*` | Mittel | Echte Inhalte/Bilder |
| Hero | Fertig | Kopfbereich, CTA | `components/sections/Hero.tsx` | Inhalte | `site_settings.hero` | Niedrig | Feinschliff Texte |
| Leistungen | Fertig | Service-Karten | `Services.tsx`, `lib/cms/` | Leistungen | `cms_services` | Niedrig | Preise/Highlights pflegen |
| Galerie | Fertig | Bildergalerie | `Gallery.tsx` | Galerie | `gallery_images`, Storage `gallery` | Mittel | Mehr Fotos |
| Bewertungen | Fertig | Öffentlich + Moderation | `Reviews.tsx`, `/api/reviews` | Bewertungen | `reviews` | Mittel | Mehr echte Reviews |
| FAQ | Fertig | Accordion | `Faq.tsx` | FAQ | `cms_faqs` | Niedrig | Inhalte erweitern |
| Beiträge | Fertig | News `/aktuelles` | `aktuelles/` | Beiträge | `cms_posts` | Niedrig | Regelmäßig posten |
| Kontaktformular | Fertig | Anfragen + E-Mail | `/api/inquiry` | Anfragen | `booking_requests` | Hoch | Resend live testen |
| Admin Login | Fertig | Passwort + Multi-User + 2FA | `lib/auth/`, `/api/admin/login` | — | `admin_users`, `admin_sessions` | Kritisch | Ersten Admin anlegen |
| Benutzer & Rollen | Fertig | RBAC | `lib/auth/permissions.ts` | Sicherheit → Benutzer | `admin_roles`, `admin_permissions` | Kritisch | Rollen zuweisen |
| Team | Fertig | Öffentlich, kein Login | `lib/team/`, TeamView | Website → Team | `team_members` | Niedrig | Team pflegen |
| Kunden | Fertig | CRM-Stammdaten | `lib/crm/customers.ts` | Kunden | `crm_customers` | Hoch | Daten pflegen |
| Anfragen | Fertig | Buchungsanfragen | `lib/crm/`, BookingsView | Anfragen | `booking_requests` | Hoch | Workflow nutzen |
| Angebote | Fertig | Quotes + PDF + Mail | `lib/crm/quotes.ts` | Angebote | `crm_quotes`, `crm_quote_items` | Hoch | Live testen |
| Rechnungen | Fertig | Invoices + PDF + Mail | `lib/crm/invoices.ts` | Rechnungen | `crm_invoices`, `crm_invoice_items` | Hoch | Live testen |
| PDF | Fertig | pdf-lib | `lib/crm/pdf.ts` | Angebote/Rechnungen | — | Mittel | Layout prüfen |
| E-Mail | Teilweise | Resend | `lib/email/` | Einstellungen → E-Mail | — | Hoch | Domain verifizieren |
| Analytics | Teilweise | Page Views | `lib/analytics/` | Analytics | `page_views` | Niedrig | Migration in Prod |
| Audit Logs | Fertig | Aktivitätsprotokoll | `lib/auth/audit.ts` | Sicherheit → Audit | `admin_audit_logs` | Mittel | Mehr Events loggen |
| 2FA | Fertig | TOTP + Backup-Codes | `lib/auth/totp.ts` | Sicherheit → 2FA | `admin_backup_codes` | Hoch | Alle Admins aktivieren |
| Einstellungen | Fertig | Firma, E-Mail, System | SettingsView | Einstellungen | `site_settings` | Mittel | Firmendaten vollständig |
| Datenschutz | Teilweise | Seite + Cookie-Banner | `datenschutz/`, CookieBanner | — | — | Hoch | Anwalt prüfen |
| SEO | Teilweise | sitemap, robots, Meta | `sitemap.ts`, `lib/seo.ts` | — | — | Mittel | Search Console |

**Legende Status:** Fertig · Teilweise fertig · Offen · Blocker
