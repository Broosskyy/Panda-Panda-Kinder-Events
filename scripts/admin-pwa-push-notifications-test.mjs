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

if (existsSync(join(root, "supabase/migrations/20260737_admin_push_enabled.sql"))) {
  ok("Migration admin_push_enabled");
} else fail("enabled migration missing");

if (existsSync(join(root, "PUSH_SETUP.md"))) ok("PUSH_SETUP.md");
else fail("PUSH_SETUP.md missing");

if (existsSync(join(root, "scripts/generate-vapid-keys.mjs"))) ok("generate-vapid-keys script");
else fail("VAPID generator script");

const sw = read("public/admin/sw.js");
if (sw.includes('addEventListener("push"') && sw.includes('addEventListener("notificationclick"')) {
  ok("Service worker push + notificationclick handlers");
} else fail("SW push handlers");
if (sw.includes("/admin/anfragen")) ok("Notification click opens /admin/anfragen");
else fail("SW click URL");
if (sw.includes("badge:")) ok("Notification badge icon");

const inquiry = read("src/app/api/inquiry/route.ts");
if (inquiry.includes("notifyAdminsNewInquiry")) ok("Inquiry route triggers push");
else fail("Inquiry push hook");

const panel = read("components/admin/AdminPushNotificationsPanel.tsx");
if (panel.includes("beginPermissionRequest") && panel.includes("runPushActivateFlow")) {
  ok("Structured activate flow with sync permission request");
} else fail("Activate flow");
if (panel.includes("handleActivateClick") && panel.includes("beginPermissionRequest()")) {
  ok("Permission started synchronously in click handler");
} else fail("iOS user-gesture permission flow");
if (panel.includes("collectPushLiveDebugState") && panel.includes("Debug-Status")) {
  ok("Live push debug panel");
} else fail("Debug panel");
if (panel.includes("Benachrichtigungen aktivieren")) ok("Activate button");
if (panel.includes("Test-Benachrichtigung senden")) ok("Test button");
if (panel.includes("Push deaktivieren")) ok("Deactivate button");
if (panel.includes("detectPushPlatform")) ok("Platform detection in UI");

const platform = read("lib/admin/push/platform.ts");
if (platform.includes("ios_pwa_required") && platform.includes("Android unterstützt")) {
  ok("iOS PWA + Android platform labels");
} else fail("Platform support");
if (platform.includes("hasBasicNotificationSupport") && platform.includes("NOT on window")) {
  ok("iOS: PushManager checked on SW registration, not window gate");
} else fail("iOS PushManager detection");

const activateFlow = read("lib/admin/push/activate-flow.ts");
if (activateFlow.includes("registration.pushManager") && activateFlow.includes("console.error")) {
  ok("Step-by-step activate flow with console.error");
} else fail("activate-flow.ts");

const debugState = read("lib/admin/push/debug-state.ts");
if (debugState.includes("pushManagerOnRegistration") && debugState.includes("collectPushLiveDebugState")) {
  ok("Live debug state collector");
} else fail("debug-state.ts");

const client = read("lib/admin/push/client.ts");
if (client.includes("serviceWorker.ready") && client.includes("unsubscribeFromAdminPush")) {
  ok("SW ready wait + unsubscribe client");
} else fail("Client subscription flow");

const pkg = read("package.json");
if (pkg.includes('"web-push"')) ok("web-push dependency");

const env = read(".env.example");
if (env.includes("NEXT_PUBLIC_VAPID_PUBLIC_KEY") && env.includes("VAPID_PRIVATE_KEY")) ok("ENV documented");

const subs = read("lib/admin/push/subscriptions.ts");
if (subs.includes("enabled: true") && subs.includes('eq("enabled", true)')) ok("enabled column + filter");
else fail("enabled subscription filter");

if (subs.includes("administrator") && subs.includes("manager")) ok("Inquiry push targets Super Admin/Admin");
else fail("Recipient filter");

const send = read("lib/admin/push/send.ts");
if (send.includes("revokePushSubscription")) ok("Revoke expired subscriptions");
else fail("Push send revoke");

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
