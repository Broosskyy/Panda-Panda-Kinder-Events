import webpush from "web-push";

const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:info@pb-kinderevents.de";

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
  webpush.setVapidDetails(VAPID_SUBJECT, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export const PUSH_ICON_PATH = "/icons/panda-icon-192.png";
export const PUSH_INQUIRY_URL = "/admin/anfragen";

export const PUSH_INQUIRY_NOTIFICATION = {
  title: "Neue Anfrage",
  body: "Es ist eine neue Anfrage eingegangen.",
  icon: PUSH_ICON_PATH,
  tag: "pb-admin-inquiry",
  data: { url: PUSH_INQUIRY_URL, type: "inquiry" },
} as const;
