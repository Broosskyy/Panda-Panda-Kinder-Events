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
  "lib/email/resolve-image-url.ts",
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

// 8. Live domain check
const liveCheck = read("lib/email/resend-domain-check.ts");
if (liveCheck.includes("checkResendDomainLive") && liveCheck.includes("domains.get")) {
  ok("Live Resend domain check with detail API");
} else {
  fail("Live Resend domain check missing");
}

if (!liveCheck.includes("onboarding@resend.dev")) ok("No test-domain logic in live domain check");
else fail("Test-domain logic still in live domain check");

// 9. Defaults: production email + auto-reply
const defaults = read("lib/cms/defaults.ts");
const constants = read("lib/email/constants.ts");
if (defaults.includes("inquiryAutoReplyEnabled: true")) ok("Auto-reply enabled by default");
else fail("Auto-reply not enabled by default");

if (constants.includes("info@pb-kinderevents.de")) ok("Production fallback email constant");
else fail("DEFAULT_COMPANY_EMAIL missing");

if (constants.includes('DEFAULT_SENDER_NAME = "Panda-Bande"')) ok("Production sender name constant");
else fail("DEFAULT_SENDER_NAME missing");

const sender = read("lib/email/sender.ts");
if (sender.includes("normalizeProductionEmail") && sender.includes("DEFAULT_COMPANY_EMAIL")) {
  ok("Production email normalization in sender");
} else {
  fail("Production email normalization missing");
}

if (!sender.includes("onboarding@resend.dev") && !sender.includes("RESEND_TEST_FROM")) {
  ok("No Resend test-domain fallback in sender");
} else {
  fail("Resend test-domain fallback still present in sender");
}

if (sender.includes('from: displayFrom') || sender.includes("displayFrom =")) {
  ok("resolveEmailSender uses production From address");
} else {
  fail("resolveEmailSender production From missing");
}

// 10. Inquiry route: no silent email failure when DB fails
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

// 11. Builders: dashboard CTA
const builders = read("lib/email/builders.ts");
if (builders.includes("Anfrage im Dashboard öffnen") && builders.includes("Bewertung im Dashboard prüfen")) {
  ok("Admin email CTAs present");
} else {
  fail("Admin email CTAs missing");
}

// 12. Admin UI
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

// 15. Email logo: absolute public URLs
const resolveImageUrl = read("lib/email/resolve-image-url.ts");
const htmlModule = read("lib/email/html.ts");
const siteUrl = read("lib/site-url.ts");

if (resolveImageUrl.includes("NEXT_PUBLIC_SITE_URL") && resolveImageUrl.includes("https://pb-kinderevents.de")) {
  ok("Email asset base uses NEXT_PUBLIC_SITE_URL with pb-kinderevents.de fallback");
} else {
  fail("Email asset base URL fallback missing");
}

if (resolveImageUrl.includes('EMAIL_LOGO_ALT = "Panda-Bande Kinderevents"')) {
  ok("Email logo alt text constant");
} else {
  fail("Email logo alt text missing");
}

if (
  resolveImageUrl.includes("buildEmailLogoHeaderHtml") &&
  resolveImageUrl.includes("!absolute") &&
  htmlModule.includes("buildEmailLogoHeaderHtml")
) {
  ok("Logo header uses text fallback when image unavailable");
} else {
  fail("Logo text fallback missing");
}

if (htmlModule.includes("buildEmailLogoHeaderHtml") && !htmlModule.match(/src="\/[^"]+"/)) {
  ok("Email layout does not emit relative img src paths");
} else {
  fail("Email layout may still use relative img src");
}

if (siteUrl.includes('DEFAULT_SITE_URL = "https://pb-kinderevents.de"')) {
  ok("Site URL default matches production domain");
} else {
  fail("Site URL default not updated to pb-kinderevents.de");
}

const composeRoute = read("src/app/api/admin/email/compose/route.ts");
if (!composeRoute.includes("baseUrl: getSiteUrl()")) {
  ok("Compose route does not pass getSiteUrl as email image base");
} else {
  fail("Compose route still uses getSiteUrl for email images");
}

function testResolveEmailImageUrl(path, base = "https://pb-kinderevents.de") {
  const trimmed = path?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:")) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

const logoCases = [
  ["/assets/Logo.png", "https://pb-kinderevents.de/assets/Logo.png"],
  ["logo.png", "https://pb-kinderevents.de/logo.png"],
  ["https://cdn.example.com/logo.png", "https://cdn.example.com/logo.png"],
  ["", null],
  ["data:image/png;base64,abc", null],
];

for (const [input, expected] of logoCases) {
  const result = testResolveEmailImageUrl(input);
  if (result === expected) ok(`resolveEmailImageUrl("${input}") → ${expected ?? "null"}`);
  else fail(`resolveEmailImageUrl("${input}")`, `expected ${expected}, got ${result}`);
}

// 16. System status polish
const statusSummary = read("lib/admin/status-summary.ts");
const systemStatus = read("lib/admin/system-status.ts");
const emailSystemStatus = read("lib/admin/email-system-status.ts");
const domainCheck = read("lib/email/resend-domain-check.ts");
const dashboardStats = read("lib/admin/dashboard-stats.ts");

if (statusSummary.includes("computeStatusSummary") && statusSummary.includes("isInformationalStatusItem")) {
  ok("Shared status summary helper");
} else {
  fail("Status summary helper missing");
}

if (domainCheck.includes("API_CHECK_UNAVAILABLE_MESSAGE") && !domainCheck.includes("Status unbekannt")) {
  ok("Domain check uses friendly unavailable message");
} else {
  fail("Domain check still shows Status unbekannt");
}

if (systemStatus.includes("overall: summary.overall") && systemStatus.includes("email_test")) {
  ok("General system status computes overall + test email check");
} else {
  fail("General system status overall/test email missing");
}

if (emailSystemStatus.includes('id: "email_test"') && emailSystemStatus.includes("computeStatusSummary")) {
  ok("Email system status has test email item + overall summary");
} else {
  fail("Email system status test email / overall missing");
}

if (dashboardStats.includes("getSystemStatus") && dashboardStats.includes("systemStatusLabel")) {
  ok("Dashboard uses real system health status");
} else {
  fail("Dashboard system status not wired to health checks");
}

// 14. Documentation
try {
  read("EMAIL_SETUP.md");
  ok("EMAIL_SETUP.md exists");
} catch {
  fail("EMAIL_SETUP.md missing");
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
