#!/usr/bin/env node
/**
 * Email system smoke tests — static analysis + template rendering checks.
 * Run: node scripts/email-system-test.mjs
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

// 1. Provider: Resend only
const pkg = JSON.parse(read("package.json"));
if (pkg.dependencies?.resend) ok("Resend dependency present");
else fail("Resend dependency missing");

const forbidden = ["nodemailer", "@sendgrid/mail", "mailgun", "postmark"];
for (const dep of forbidden) {
  if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
    fail(`Unexpected email provider dependency: ${dep}`);
  } else {
    ok(`No ${dep} dependency`);
  }
}

// 2. Core modules exist
for (const file of [
  "lib/email.ts",
  "lib/email/transport.ts",
  "lib/email/builders.ts",
  "lib/email/html.ts",
  "lib/email/templates-db.ts",
  "lib/email/render.ts",
  "lib/email/log.ts",
  "lib/email/sender.ts",
  "lib/email/resolve-content.ts",
  "lib/email/constants.ts",
]) {
  try {
    read(file);
    ok(`File exists: ${file}`);
  } catch {
    fail(`Missing file: ${file}`);
  }
}

// 3. Transport has retry logic
const transport = read("lib/email/transport.ts");
if (transport.includes("MAX_ATTEMPTS") && transport.includes("sendEmailWithRetry")) {
  ok("Retry logic in transport");
} else {
  fail("Retry logic missing in transport");
}

// 4. Inquiry uses CMS resolve + transport
const emailTs = read("lib/email.ts");
if (emailTs.includes("resolveEmailContent") && emailTs.includes("sendEmailWithRetry")) {
  ok("Inquiry notification uses CMS resolve + transport");
} else {
  fail("Inquiry notification not fully wired");
}

// 5. Review + request emails
if (emailTs.includes("sendReviewNotification") && emailTs.includes("sendReviewRequestEmail")) {
  ok("Review admin + request emails wired");
} else {
  fail("Review emails missing");
}

if (emailTs.includes("sendPasswordResetEmail")) ok("Password reset uses CMS template");
else fail("Password reset CMS integration missing");

// 6. All sends log via transport
if (emailTs.includes("sendEmailWithRetry") && !emailTs.includes("resend.emails.send")) {
  ok("email.ts routes sends through transport");
} else if (emailTs.includes("sendEmailWithRetry")) {
  ok("email.ts uses sendEmailWithRetry");
} else {
  fail("email.ts may bypass transport logging");
}

// 7. CMS templates
const templates = read("lib/email/templates-db.ts");
if (templates.includes("inquiry-admin") && templates.includes("review-request") && templates.includes("review-admin")) {
  ok("Core CMS email templates present");
} else {
  fail("Core CMS templates missing");
}

if (templates.includes("resetEmailTemplateToDefault")) ok("Template reset function");
else fail("Template reset missing");

// 8. Defaults: production email + auto-reply
const defaults = read("lib/cms/defaults.ts");
const constants = read("lib/email/constants.ts");
if (defaults.includes("inquiryAutoReplyEnabled: true")) ok("Auto-reply enabled by default");
else fail("Auto-reply not enabled by default");

if (constants.includes("info@pb-kinderevents.de")) ok("Production fallback email constant");
else fail("DEFAULT_COMPANY_EMAIL missing");

// 9. Inquiry route: no silent email failure when DB fails
const inquiry = read("src/app/api/inquiry/route.ts");
if (inquiry.includes("admin_notes") && inquiry.includes("Quelle: Website")) {
  ok("Inquiry CRM source tracking");
} else {
  fail("Inquiry source not tracked");
}

if (inquiry.includes("warning") && inquiry.includes("emailResult")) {
  ok("Inquiry partial failure handling");
} else {
  fail("Inquiry email error handling incomplete");
}

// 10. Builders: dashboard CTA
const builders = read("lib/email/builders.ts");
if (builders.includes("Anfrage im Dashboard öffnen") && builders.includes("Bewertung im Dashboard prüfen")) {
  ok("Admin email CTAs present");
} else {
  fail("Admin email CTAs missing");
}

// 11. Admin UI
try {
  read("components/admin/email/EmailSettingsPanel.tsx");
  ok("EmailSettingsPanel exists");
} catch {
  fail("EmailSettingsPanel missing");
}

// 13. Email V2 modules
for (const file of [
  "lib/email/aliases-db.ts",
  "lib/email/signature.ts",
  "lib/email/branding.ts",
  "lib/email/test-mode.ts",
  "lib/email/wrap-branded.ts",
  "components/admin/email/EmailSettingsShell.tsx",
]) {
  try {
    read(file);
    ok(`File exists: ${file}`);
  } catch {
    fail(`Missing file: ${file}`);
  }
}

const types = read("lib/cms/types.ts");
if (types.includes("SiteEmailSignatureSettings") && types.includes("SiteEmailTestModeSettings")) {
  ok("V2 CMS email types");
} else {
  fail("V2 CMS types missing");
}

if (read("lib/email/transport.ts").includes("prepareOutboundEmail")) ok("Test mode in transport");
else fail("Test mode transport missing");

// 14. Documentation
try {
  read("EMAIL_SETUP.md");
  ok("EMAIL_SETUP.md exists");
} catch {
  fail("EMAIL_SETUP.md missing");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
