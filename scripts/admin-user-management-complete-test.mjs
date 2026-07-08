#!/usr/bin/env node
/**
 * Admin user management complete flow smoke tests.
 * Run: node scripts/admin-user-management-complete-test.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
let failed = 0;

function ok(label) {
  passed++;
  console.log(`✓ ${label}`);
}

function fail(label, detail = "") {
  failed++;
  console.error(`✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const migration = read("supabase/migrations/20260735_admin_users_invite_permissions.sql");
if (migration.includes("users:invite") && migration.includes("must_change_password")) ok("RBAC migration for invites + password flag");
else fail("RBAC migration incomplete");

const dialog = read("components/admin/AdminUserManageDialog.tsx");
if (dialog.includes("Benutzer einladen") && dialog.includes("Manuell erstellen")) ok("Unified user manage dialog with both flows");
else fail("User manage dialog incomplete");

const usersView = read("components/admin/views/UsersView.tsx");
if (usersView.includes("AdminUserManageDialog") && usersView.includes("setDialogOpen(true)")) ok("UsersView opens dialog instead of navigation");
else fail("UsersView dialog wiring missing");

const invitesView = read("components/admin/views/InvitesView.tsx");
if (invitesView.includes("admin-invites-empty") && invitesView.includes("AdminActionMenu")) ok("InvitesView empty state + action menu");
else fail("InvitesView improvements missing");

const invitesApi = read("src/app/api/admin/invites/route.ts");
if (invitesApi.includes("canManageInvites") && invitesApi.includes("copy_link") && invitesApi.includes("DELETE")) ok("Invite API: permissions, copy link, delete");
else fail("Invite API incomplete");

const usersApi = read("src/app/api/admin/users/route.ts");
if (usersApi.includes("canInvite") && usersApi.includes("user_created") && usersApi.includes("canCreateUsersManually")) ok("Users API meta + manual create");
else fail("Users API incomplete");

const perms = read("lib/auth/invite-permissions.ts");
if (perms.includes("canManageInvites") && perms.includes("canCreateUsersManually")) ok("Invite permission helpers");
else fail("Permission helpers missing");

const login = read("src/app/api/admin/login/route.ts");
if (login.includes("requiresPasswordChange") && login.includes("change_password")) ok("Login enforces password change");
else fail("Login password change missing");

const loginForm = read("components/admin/AdminLoginForm.tsx");
if (loginForm.includes("password-change")) ok("Login form password-change step");
else fail("Login form password step missing");

const globals = read("src/app/globals.css");
if (globals.includes("admin-user-manage-root") && globals.includes("admin-invites-empty")) ok("Mobile-friendly dialog + empty state CSS");
else fail("CSS missing");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
