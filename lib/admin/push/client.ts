"use client";

import { getVapidPublicKeyClient } from "@/lib/admin/push/public-config";
import { detectPushPlatform, hasPushApis } from "@/lib/admin/push/platform";

export { detectPushPlatform, hasPushApis };

export function isPushApiSupported(): boolean {
  return detectPushPlatform().canSubscribe;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getAdminServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    let reg = await navigator.serviceWorker.getRegistration("/admin/");
    if (!reg) {
      reg = await navigator.serviceWorker.register("/admin/sw.js", { scope: "/admin/" });
    }
    await navigator.serviceWorker.ready;
    return reg;
  } catch {
    return null;
  }
}

export async function subscribeToAdminPush(): Promise<PushSubscription | null> {
  const publicKey = getVapidPublicKeyClient();
  if (!publicKey) return null;

  const registration = await getAdminServiceWorkerRegistration();
  if (!registration?.pushManager) return null;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });
}

export async function unsubscribeFromAdminPush(): Promise<string | null> {
  const registration = await getAdminServiceWorkerRegistration();
  const subscription = await registration?.pushManager?.getSubscription();
  if (!subscription) return null;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}

export function subscriptionToStored(subscription: PushSubscription) {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Ungültige Push-Subscription.");
  }
  return {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
  };
}
