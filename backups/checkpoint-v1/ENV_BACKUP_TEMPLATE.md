# Umgebungsvariablen — Vorlage (KEINE echten Secrets hier eintragen!)

Kopiere diese Liste in einen **passwortgeschützten Passwort-Manager** oder eine sichere `.env.local` auf deinem Rechner.

```env
# ─── Supabase ───────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=NICHT_HIER_EINFÜGEN

# ─── E-Mail (Resend) ────────────────────────────────────────
RESEND_API_KEY=NICHT_HIER_EINFÜGEN
INQUIRY_NOTIFICATION_EMAIL=

# ─── Admin ──────────────────────────────────────────────────
ADMIN_PASSWORD=NICHT_HIER_EINFÜGEN

# ─── Website ────────────────────────────────────────────────
NEXT_PUBLIC_SITE_URL=

# ─── Optional ───────────────────────────────────────────────
# VERCEL_URL wird von Vercel automatisch gesetzt
```

## Wo finde ich die Werte?

| Variable | Quelle |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API → service_role (**geheim!**) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `ADMIN_PASSWORD` | Selbst gewählt; nur für Legacy-Login bis erster Admin-User |
| `NEXT_PUBLIC_SITE_URL` | z. B. `https://panda-bande-events.de` |

## Sicherheitsregeln

- **Niemals** Service Role Key oder Resend Key in Git committen
- **Niemals** in öffentlichen Dokumenten speichern
- Bei Verlust: Keys in Supabase/Resend **rotieren** (neu generieren)
