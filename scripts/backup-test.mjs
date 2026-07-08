#!/usr/bin/env node
/**
 * Backup system smoke tests — static analysis + sanitization checks.
 * Run: node scripts/backup-test.mjs
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

const pkg = JSON.parse(read("package.json"));
if (pkg.dependencies?.jszip) ok("jszip dependency present");
else fail("jszip dependency missing");

for (const file of [
  "lib/admin/backup-export.ts",
  "lib/admin/sanitize-export.ts",
  "src/app/api/admin/backup/export/route.ts",
  "components/admin/settings/SystemBackupPanel.tsx",
  "components/admin/settings/SystemSettingsShell.tsx",
]) {
  try {
    read(file);
    ok(`File exists: ${file}`);
  } catch {
    fail(`Missing file: ${file}`);
  }
}

const route = read("src/app/api/admin/backup/export/route.ts");
if (route.includes('requireAdmin("backup:write")') || route.includes('requireAdmin("settings:write")')) {
  ok("Backup route requires backup:write permission");
} else fail("Backup route missing backup:write guard");

if (route.includes("buildAdminBackupZip")) ok("Backup route uses buildAdminBackupZip");
else fail("Backup route missing ZIP builder");

const backupLib = read("lib/admin/backup-export.ts");
const requiredZipFiles = [
  "backup-info.json",
  "settings.json",
  "booking_requests.json",
  "customers.json",
  "reviews.json",
  "gallery_items.json",
  "blog_posts.json",
  "quotes.json",
  "invoices.json",
  "email_templates.json",
  "email_logs.json",
];

for (const name of requiredZipFiles) {
  if (backupLib.includes(`"${name}"`)) ok(`ZIP contains ${name}`);
  else fail(`ZIP missing ${name}`);
}

if (backupLib.includes("crm_customers") && backupLib.includes("booking_requests")) {
  ok("Expected CRM/CMS tables referenced");
} else {
  fail("CRM/CMS table mapping incomplete");
}

if (!backupLib.includes("admin_users") && !backupLib.includes("admin_sessions")) {
  ok("Admin auth tables not exported");
} else {
  fail("Admin auth tables must not be exported");
}

const sanitizeLib = read("lib/admin/sanitize-export.ts");
if (sanitizeLib.includes("password_hash") && sanitizeLib.includes("[REDACTED]")) {
  ok("Sensitive fields are redacted");
} else {
  fail("Sensitive field redaction missing");
}

const forbiddenInBackup = ["RESEND_API_KEY", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_PASSWORD"];
for (const token of forbiddenInBackup) {
  if (backupLib.includes(token)) fail(`Backup lib references env secret: ${token}`);
  else ok(`Backup lib does not embed ${token}`);
}

const panel = read("components/admin/settings/SystemBackupPanel.tsx");
if (panel.includes("/api/admin/backup/export")) ok("Backup panel calls export API");
else fail("Backup panel missing export API call");

if (panel.includes("Backup wurde erstellt")) ok("Success message present");
else fail("Success message missing");

if (panel.includes("Backup konnte nicht vollständig erstellt werden")) ok("Partial/error message present");
else fail("Partial/error message missing");

const shell = read("components/admin/settings/SystemSettingsShell.tsx");
if (shell.includes("tab=system&systemTab=") && shell.includes('id: "backup"')) ok("System backup sub-tab route present");
else fail("System backup sub-tab route missing");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
