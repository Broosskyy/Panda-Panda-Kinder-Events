import webpush from "web-push";
import { resolveVapidSubject, SYSTEM_DEFAULTS } from "@/lib/system-config";

export function getVapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return key || null;
}

export function isPushConfigured(): boolean {
  return Boolean(getVapidPublicKey() && process.env.VAPID_PRIVATE_KEY?.trim());
}

let vapidConfigured = false;

export function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  const publicKey = getVapidPublicKey();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(resolveVapidSubject(), publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export const PUSH_ICON_PATH = SYSTEM_DEFAULTS.push.iconPath;
export const PUSH_INQUIRY_URL = SYSTEM_DEFAULTS.push.inquiryUrl;

export const PUSH_INQUIRY_NOTIFICATION = {
  title: "Neue Anfrage",
  body: "Es ist eine neue Anfrage eingegangen.",
  icon: PUSH_ICON_PATH,
  tag: "pb-admin-inquiry",
  data: { url: PUSH_INQUIRY_URL, type: "inquiry" },
} as const;
