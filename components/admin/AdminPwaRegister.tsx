"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function AdminPwaRegister() {
  const [installable, setInstallable] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/admin-sw.js", { scope: "/admin" })
      .catch((err) => console.warn("[pwa] registration failed", err));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setInstallable(false);
    setDeferred(null);
  };

  if (!installable) return null;

  return (
    <div className="admin-pwa-install-banner" role="status">
      <p className="text-sm">Panda-Bande Admin als App installieren?</p>
      <button type="button" className="dash-v2-customize-btn" onClick={() => void install()}>
        Installieren
      </button>
    </div>
  );
}

export async function lockAdminPwa(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration("/admin");
  reg?.active?.postMessage({ type: "LOCK_PWA" });
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith("pb-admin")).map((k) => caches.delete(k)));
}
