# Admin Bootstrap Fix Report

**Datum:** 8. Juli 2026  
**Problem:** Eingeloggte Admins sahen „Noch keine Admin-Benutzer. Lege den ersten Admin-Zugang an.“

---

## Analyse

### Auth-Architektur (wichtig)

Panda-Bande nutzt **kein** Supabase `auth.users` für den Admin-Login.

| Schicht | Tabelle / Mechanismus |
|---------|---------------------|
| Login | `admin_users` + `admin_sessions` (Passwort-Hash, Session-Cookie) |
| Legacy-Fallback | `ADMIN_PASSWORD` Cookie — nur wenn `admin_users` leer |
| Berechtigungen | `admin_roles` → `admin_role_permissions` → `admin_permissions` |

### Identifizierte Ursachen

1. **API blockierte mit `users:read`**
   - `GET /api/admin/users` verlangte `users:read`
   - Rollen wie **Admin (manager)** und **Mitarbeiter** haben diese Berechtigung nicht
   - Antwort: HTTP 403 → UI behielt `users = []` → fälschliche Bootstrap-Meldung

2. **UI interpretierte leere Liste falsch**
   - `UsersView` zeigte Bootstrap-Empty-State bei `users.length === 0`
   - Kein Unterschied zwischen „keine Benutzer in DB“ und „Laden fehlgeschlagen / keine Berechtigung“

3. **Legacy-Session ohne DB-Eintrag**
   - Legacy-Login (Cookie) hat keinen `admin_users`-Datensatz
   - Liste war leer, obwohl Session gültig

4. **Nebenbefunde (robuster gemacht)**
   - `countAdminUsers()` schluckte DB-Fehler als `0`
   - `listUsers()` scheiterte hart bei fehlendem `team_members`-Join
   - `getPermissionsForRole()` lieferte bei DB-Fehler `[]` — auch Super Admins ohne Rechte

### RLS

`admin_users` hat RLS mit `service_role`-Policy (Zero-Trust-Migration).  
API-Routen nutzen `SUPABASE_SERVICE_ROLE_KEY` → RLS ist **kein** Blocker für Server-Reads.

---

## Lösung

### 1. `resolveUsersForSession()` (`lib/auth/users.ts`)

- Bei `users:read`: volle Liste laden
- **Immer** den eingeloggten Benutzer einbinden (auch ohne `users:read`)
- Legacy-Session → virtueller Profil-Eintrag `legacy-session`
- `listUsers()` mit Fallback ohne `team_members`-Join

### 2. `GET /api/admin/users`

- Kein harter `requireAdmin("users:read")` mehr für Lesen
- Antwort enthält `meta`: `canListAll`, `canManageUsers`, `selfOnly`, `isLegacy`, `currentUserId`
- Schreiben (POST/PATCH/DELETE) weiterhin nur mit `users:write`

### 3. `UsersView`

- Ladezustand + Fehlerzustand getrennt
- Bootstrap-Empty-State **nur** wenn nicht authentifiziert und explizit `showBootstrap`
- Eingeloggt + leer → klarer Hinweis statt Bootstrap
- `selfOnly` → Hinweis „Sie sehen Ihr eigenes Profil“
- Legacy → Hinweis zum Anlegen eines echten Benutzers
- „Benutzer anlegen“ nur mit `canManageUsers`

### 4. Robustheit

- `countAdminUsersSafe()` für Legacy-Entscheidungen
- Super-Admin-Fallback in `getPermissionsForRole()` bei DB-Fehler

---

## Verifikation

```
npm run lint       ✅
npm run typecheck  ✅
npm run build      ✅
```

---

## Ergebnis

| Szenario | Vorher | Nachher |
|----------|--------|---------|
| Super Admin eingeloggt | Liste OK | Liste OK |
| Admin/Mitarbeiter ohne `users:read` | Bootstrap-Fehler | Eigenes Profil sichtbar |
| Legacy-Cookie eingeloggt | Bootstrap-Fehler | Legacy-Profil + Hinweis |
| API-Fehler | Bootstrap-Fehler | Fehlermeldung |

**Regel:** Ist eine Session aktiv, erscheint nie die „Ersten Admin anlegen“-Ansicht.
