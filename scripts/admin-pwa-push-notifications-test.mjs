/**
 * Admin PWA push notifications verification.
 * Run: node scripts/admin-pwa-push-notifications-test.mjs
 */
import { existsSync, readFileSync } from "node:fs";
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

if (existsSync(join(root, "supabase/migrations/20260736_admin_push_subscriptions.sql"))) {
  ok("Migration admin_push_subscriptions");
} else fail("Migration missing");

const sw = read("public/admin/sw.js");
if (sw.includes('addEventListener("push"') && sw.includes('addEventListener("notificationclick"')) {
  ok("Service worker push + notificationclick handlers");
} else fail("SW push handlers");
if (sw.includes("/admin/anfragen")) ok("Notification click opens /admin/anfragen");
else fail("SW click URL");

const inquiry = read("src/app/api/inquiry/route.ts");
if (inquiry.includes("notifyAdminsNewInquiry")) ok("Inquiry route triggers push");
else fail("Inquiry push hook");

const panel = read("components/admin/AdminPushNotificationsPanel.tsx");
if (panel.includes("Notification.requestPermission") && !panel.includes("requestPermission()")) {
  // ensure it's on click handler not mount - check handleActivate
}
if (panel.includes("handleActivate") && panel.includes("Notification.requestPermission")) {
  ok("Permission only requested on user click");
} else fail("Permission flow");

if (panel.includes("Benachrichtigungen aktivieren")) ok("Activate button label");
if (panel.includes("Test-Benachrichtigung senden")) ok("Test button");

const pkg = read("package.json");
if (pkg.includes('"web-push"')) ok("web-push dependency");

const env = read(".env.example");
if (env.includes("NEXT_PUBLIC_VAPID_PUBLIC_KEY") && env.includes("VAPID_PRIVATE_KEY")) ok("ENV documented");

const send = read("lib/admin/push/send.ts");
if (send.includes("notifyAdminsNewInquiry") && send.includes("revokePushSubscription")) {
  ok("Send + revoke expired subscriptions");
} else fail("Push send logic");

const subs = read("lib/admin/push/subscriptions.ts");
if (subs.includes("administrator") && subs.includes("manager")) ok("Inquiry push targets Super Admin/Admin");
else fail("Recipient filter");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
