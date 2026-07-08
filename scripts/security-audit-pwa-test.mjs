#!/usr/bin/env node
/**
 * Admin Security / Audit / PWA V2 smoke tests — static analysis.
 * Run: node scripts/security-audit-pwa-test.mjs
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

const requiredFiles = [
  "lib/auth/audit.ts",
  "lib/auth/request-context.ts",
  "lib/auth/login-history.ts",
  "src/app/api/admin/security/center/route.ts",
  "src/app/api/admin/security/login-history/route.ts",
  "components/admin/views/SecurityCenterView.tsx",
  "components/admin/views/LoginHistoryView.tsx",
  "components/admin/AdminPwaRegister.tsx",
  "public/admin-sw.js",
  "src/app/admin/manifest.webmanifest/route.ts",
  "supabase/migrations/20260730_security_audit_pwa_v2.sql",
];

for (const file of requiredFiles) {
  try {
    read(file);
    ok(`File exists: ${file}`);
  } catch {
    fail(`Missing file: ${file}`);
  }
}

const audit = read("lib/auth/audit.ts");
if (audit.includes("queueAuditLog") && audit.includes("insertWithRetry")) ok("Audit logging is async with retry");
else fail("Audit async/retry missing");

if (audit.includes('"password"') && audit.includes("sanitizeAuditPayload")) ok("Audit sanitizes sensitive fields");
else fail("Audit sanitization missing");

const requestCtx = read("lib/auth/request-context.ts");
if (requestCtx.includes("maskIp") && requestCtx.includes("getRequestClientContext")) {
  ok("Request context masks IP and parses client");
} else {
  fail("Request context incomplete");
}

const loginRoute = read("src/app/api/admin/login/route.ts");
for (const action of ["login", "login_failed", "logout"]) {
  if (loginRoute.includes(`action: "${action}"`)) ok(`Login route audits ${action}`);
  else fail(`Login route missing audit: ${action}`);
}

if (loginRoute.includes("writeAuditLogFromRequest")) ok("Login uses request-enriched audit");
else fail("Login route missing writeAuditLogFromRequest");

const sidebar = read("components/admin/AdminSidebar.tsx");
if (sidebar.includes("lockAdminPwa")) ok("Logout locks admin PWA");
else fail("Logout missing lockAdminPwa");

const sessionsView = read("components/admin/views/SessionsView.tsx");
if (sessionsView.includes("revoke_one")) ok("Sessions UI supports single revoke");
else fail("Sessions UI missing revoke_one");

const adminManifest = read("src/app/admin/manifest.webmanifest/route.ts");
if (adminManifest.includes('scope: "/admin"') && adminManifest.includes("standalone")) {
  ok("Admin manifest scoped to /admin standalone");
} else {
  fail("Admin manifest misconfigured");
}

const publicManifest = read("src/app/manifest.ts");
if (publicManifest.includes('display: "browser"')) ok("Public manifest is not installable PWA");
else fail("Public manifest should use display browser");

const sw = read("public/admin-sw.js");
if (sw.includes('pathname.startsWith("/admin")') && sw.includes("LOCK_PWA")) {
  ok("Service worker scoped to /admin with lock message");
} else {
  fail("Service worker protection incomplete");
}

const pwaEarly = read("components/admin/AdminPwaEarlyCapture.tsx");
const pwaProvider = read("components/admin/AdminPwaProvider.tsx");
if (
  (pwaEarly.includes("registerAdminServiceWorker") || pwaProvider.includes("registerAdminServiceWorker")) &&
  (pwaEarly.includes("beforeinstallprompt") || pwaProvider.includes("beforeinstallprompt"))
) {
  ok("PWA registration + install prompt");
} else {
  fail("PWA registration incomplete");
}

const migration = read("supabase/migrations/20260730_security_audit_pwa_v2.sql");
for (const col of ["device_label", "country_code", "ip_masked", "role_slug"]) {
  if (migration.includes(col)) ok(`Migration adds ${col}`);
  else fail(`Migration missing ${col}`);
}

const auditRoutes = [
  "src/app/api/admin/gallery/route.ts",
  "src/app/api/admin/reviews/route.ts",
  "src/app/api/admin/posts/route.ts",
  "src/app/api/admin/quotes/route.ts",
  "src/app/api/admin/invoices/route.ts",
  "src/app/api/admin/users/route.ts",
  "src/app/api/admin/settings/route.ts",
];

for (const route of auditRoutes) {
  const content = read(route);
  if (content.includes("writeAuditLogFromRequest")) ok(`${route} uses enriched audit`);
  else fail(`${route} missing writeAuditLogFromRequest`);
}

const adminRoute = read("lib/admin-route.ts");
if (adminRoute.includes("Du hast für diesen Bereich keine Berechtigung")) {
  ok("Friendly permission error message");
} else {
  fail("Missing friendly permission errors");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
