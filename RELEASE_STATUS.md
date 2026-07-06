# Release-Status — v1.0-checkpoint

**Datum:** 2026-07-06

| Bereich | Status | Anmerkung |
|---------|--------|-----------|
| Website | Fertig | CMS-gesteuert, RC5 polish |
| Admin | Fertig | Dashboard, alle Hauptmodule |
| CMS | Fertig | Inhalte, Leistungen, Galerie, FAQ, Beiträge, Team |
| CRM | Fertig | Kunden, Angebote, Rechnungen, PDF, E-Mail |
| Security | Fertig | Multi-User, Rollen, 2FA, Audit, Sessions |
| E-Mail | Teilweise fertig | Resend integriert; **Domain-Verifizierung offen** |
| Domain | Offen | Custom Domain / DNS final |
| SEO | Teilweise fertig | sitemap, robots; Search Console offen |
| Analytics | Teilweise fertig | Code fertig; Prod-Migration prüfen |
| Datenschutz | Teilweise fertig | Seiten vorhanden; **rechtliche Prüfung offen** |
| Performance | Teilweise fertig | Build OK; Bildoptimierung laufend |

## Blocker für Livegang

1. Supabase-Migrationen in Produktion ausgeführt
2. Env Vars in Vercel vollständig
3. Resend-Domain verifiziert (für Kunden-E-Mails)
4. Erster Admin-Benutzer + 2FA
5. Rechtstexte geprüft

## Nicht-Blocker

- Google Analytics / Business
- Blog-Inhalte
- Erweiterte SEO
- Permission-UI für Navigation
