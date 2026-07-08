"use client";

import { useEffect } from "react";
import { storeDeferredPrompt, type BeforeInstallPromptEvent } from "@/lib/admin/pwa-install";

/** Captures beforeinstallprompt before AdminPwaProvider mounts (e.g. on login screen). */
export function AdminPwaEarlyCapture() {
  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      storeDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      import("@/lib/admin/pwa-install").then(({ markPwaInstalled }) => markPwaInstalled());
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
