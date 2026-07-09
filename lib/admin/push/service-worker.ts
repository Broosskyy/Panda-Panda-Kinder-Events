"use client";

import {
  ADMIN_SW_SCOPE,
  ADMIN_SW_SCRIPT_PATH,
} from "@/lib/admin/routes";
import { PUSH_SW_READY_TIMEOUT_MS, withTimeout } from "@/lib/admin/push/timeout";

/** Register (if needed) and wait until the admin SW controls the current page. */
export async function ensureAdminServiceWorkerReady(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service Worker API nicht verfügbar.");
  }

  let reg = await navigator.serviceWorker.getRegistration(ADMIN_SW_SCOPE);
  if (!reg) {
    reg = await navigator.serviceWorker.register(ADMIN_SW_SCRIPT_PATH, { scope: ADMIN_SW_SCOPE });
  }

  await withTimeout(navigator.serviceWorker.ready, PUSH_SW_READY_TIMEOUT_MS, "serviceWorker.ready");
  return reg;
}

export async function getAdminServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await ensureAdminServiceWorkerReady();
  } catch {
    return null;
  }
}
