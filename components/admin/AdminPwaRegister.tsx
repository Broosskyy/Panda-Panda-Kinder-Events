/** Locks admin PWA caches after logout. */
import { ADMIN_SW_SCOPE } from "@/lib/admin/routes";

export async function lockAdminPwa(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration(ADMIN_SW_SCOPE);
  reg?.active?.postMessage({ type: "LOCK_PWA" });
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith("pb-admin")).map((k) => caches.delete(k)));
}
