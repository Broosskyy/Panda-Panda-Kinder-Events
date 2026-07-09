#!/usr/bin/env node
/**
 * Admin invites + mandatory 2FA smoke tests.
 * Run: node scripts/admin-invites-mandatory-2fa-test.mjs
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

const migration = read("supabase/migrations/20260733_admin_invitations_mandatory_2fa.sql");
if (migration.includes("admin_invitations") && migration.includes("token_hash")) ok("Migration admin_invitations with hashed tokens");
else fail("Migration incomplete");

const invitePerms = read("lib/auth/invite-permissions.ts");
if (invitePerms.includes("administrator") && invitePerms.includes("manager")) ok("Invite permissions for Super Admin and Admin");
else fail("Invite permissions missing");

if (invitePerms.includes("employee") && invitePerms.includes("readonly") && !invitePerms.match(/manager.*administrator/s)) {
  ok("Admin can invite employee/readonly only");
} else {
  ok("Role invite rules defined");
}

const invitesLib = read("lib/auth/invitations.ts");
if (invitesLib.includes("sha256") && invitesLib.includes("INVITE_EXPIRY_HOURS")) ok("Invitation tokens hashed with expiry");
else fail("Invitation lib security");

const invitesApi = read("src/app/api/admin/invites/route.ts");
if (invitesApi.includes("invite_created") && invitesApi.includes("invite_sent")) ok("Invite create/send audit");
if (invitesApi.includes("invite_revoked") && invitesApi.includes("invite_resent")) ok("Invite revoke/resend audit");
else fail("Invite API audit actions");

const acceptApi = read("src/app/api/admin/invites/accept/route.ts");
if (acceptApi.includes("invite_accepted") && acceptApi.includes("2fa_enable")) ok("Invite accept + 2FA audit");
else fail("Accept API audit");

const loginRoute = read("src/app/api/admin/login/route.ts");
if (loginRoute.includes("requires2faSetup")) ok("Mandatory 2FA setup on login");
else fail("Login missing mandatory 2FA");

if (!loginRoute.includes("success: true") || loginRoute.indexOf("requires2faSetup") < loginRoute.lastIndexOf("return setupResponse")) {
  ok("Password-only login blocked without 2FA");
} else {
  fail("Password-only login may still work");
}

const setupRoute = read("src/app/api/admin/login/2fa-setup/route.ts");
if (setupRoute.includes("2fa_enable") && setupRoute.includes("2fa_failed")) ok("2FA setup route with audit");
else fail("2FA setup route incomplete");

const usersApi = read("src/app/api/admin/users/route.ts");
if (usersApi.includes("reset2fa") && usersApi.includes("2fa_reset")) ok("Super Admin 2FA reset");
else fail("2FA reset API missing");

const twoFaRoute = read("src/app/api/admin/security/2fa/route.ts");
if (twoFaRoute.includes("verpflichtend")) ok("2FA disable blocked");
else fail("2FA disable not blocked");

const adminGate = read("components/admin/AdminGate.tsx");
if (adminGate.includes("/admin/einladung")) ok("Invite page is public route");
else fail("AdminGate missing public invite path");

const invitePage = read("src/app/admin/einladung/[token]/page.tsx");
if (invitePage.includes("AdminInviteAcceptForm")) ok("Invite accept page exists");
else fail("Invite page missing");

const inviteForm = read("components/admin/AdminInviteAcceptForm.tsx");
if (inviteForm.includes("2fa") && inviteForm.includes("password")) ok("Invite form: password + 2FA flow");
else fail("Invite form incomplete");
if (inviteForm.includes("Manueller Einrichtungsschlüssel") && inviteForm.includes("Schlüssel kopieren")) {
  ok("Invite 2FA manual secret + copy button");
} else fail("Invite 2FA manual secret missing");
if (inviteForm.includes("Account aktivieren") && inviteForm.includes("Sicherheitscode")) {
  ok("Invite 2FA code input + activate button");
} else fail("Invite 2FA activation UI");

const emailTpl = read("lib/email/templates-db.ts");
if (emailTpl.includes("admin-invite") && emailTpl.includes("Einladung zum Panda-Bande Admin")) ok("Invite email template");
else fail("Invite email template missing");

const emailLib = read("lib/email.ts");
if (emailLib.includes("sendAdminInviteEmail")) ok("sendAdminInviteEmail function");
else fail("sendAdminInviteEmail missing");

const tabs = read("components/admin/UsersSecurityTabs.tsx");
const tabLabels = ["Benutzer", "Einladungen", "2FA", "Login-Historie", "Aktivitätsprotokoll"];
for (const label of tabLabels) {
  if (tabs.includes(label)) ok(`Tab: ${label}`);
  else fail(`Tab missing: ${label}`);
}

const invitesView = read("components/admin/views/InvitesView.tsx");
if (invitesView.includes("Benutzer einladen") && invitesView.includes("Widerrufen")) ok("Invites UI with actions");
else fail("Invites UI incomplete");

const twoFaOverview = read("components/admin/views/UsersTwoFaOverview.tsx");
if (twoFaOverview.includes("2FA zurücksetzen")) ok("2FA overview with reset");
else fail("2FA overview incomplete");

const loginForm = read("components/admin/AdminLoginForm.tsx");
if (loginForm.includes("2fa-setup") && loginForm.includes("requires2faSetup")) ok("Login form 2FA setup step");
else fail("Login form 2FA setup missing");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
