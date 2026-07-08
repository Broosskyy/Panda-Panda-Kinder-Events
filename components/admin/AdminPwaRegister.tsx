/** Locks admin PWA caches after logout. */
export async function lockAdminPwa(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration("/admin");
  reg?.active?.postMessage({ type: "LOCK_PWA" });
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith("pb-admin")).map((k) => caches.delete(k)));
}
