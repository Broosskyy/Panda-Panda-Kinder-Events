"use client";

import { useEffect } from "react";
import {
  markPwaInstalled,
  registerAdminServiceWorker,
  storeDeferredPrompt,
  type BeforeInstallPromptEvent,
} from "@/lib/admin/pwa-install";

/** Captures beforeinstallprompt and registers the admin service worker on every /admin page. */
export function AdminPwaEarlyCapture() {
  useEffect(() => {
    void registerAdminServiceWorker();

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      storeDeferredPrompt(e as BeforeInstallPromptEvent);
      window.dispatchEvent(new CustomEvent("pb-pwa-prompt-available"));
    };

    const onInstalled = () => {
      markPwaInstalled();
      window.dispatchEvent(new CustomEvent("pb-pwa-installed"));
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return null;
}
