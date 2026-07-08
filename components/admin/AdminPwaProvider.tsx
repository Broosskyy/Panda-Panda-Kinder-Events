"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isIosDevice,
  isStandalonePwa,
  markPwaDismissed,
  markPwaInstalled,
  readPwaDismissed,
  readPwaInstalledFlag,
  type PwaInstallOutcome,
} from "@/lib/admin/pwa-install";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

interface AdminPwaContextValue {
  canInstall: boolean;
  showIosGuide: boolean;
  isInstalled: boolean;
  dismissed: boolean;
  install: () => Promise<PwaInstallOutcome>;
  dismiss: () => void;
}

const AdminPwaContext = createContext<AdminPwaContextValue | null>(null);

export function AdminPwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ios] = useState(() => isIosDevice());

  useEffect(() => {
    setInstalled(isStandalonePwa() || readPwaInstalledFlag());
    setDismissed(readPwaDismissed());

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/admin-sw.js", { scope: "/admin" })
      .catch((err) => console.warn("[pwa] registration failed", err));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    const onInstalled = () => {
      markPwaInstalled();
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<PwaInstallOutcome> => {
    if (!deferred) return "unavailable";
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      console.info("[pwa] install choice:", outcome);
      if (outcome === "accepted") {
        markPwaInstalled();
        setInstalled(true);
      }
      setDeferred(null);
      return outcome;
    } catch (err) {
      console.warn("[pwa] install failed", err);
      return "unavailable";
    }
  }, [deferred]);

  const dismiss = useCallback(() => {
    markPwaDismissed();
    setDismissed(true);
  }, []);

  const value = useMemo<AdminPwaContextValue>(
    () => ({
      canInstall: Boolean(deferred) && !installed && !dismissed,
      showIosGuide: ios && !installed && !dismissed && !deferred,
      isInstalled: installed,
      dismissed,
      install,
      dismiss,
    }),
    [deferred, dismissed, dismiss, install, installed, ios],
  );

  return <AdminPwaContext.Provider value={value}>{children}</AdminPwaContext.Provider>;
}

export function useAdminPwa(): AdminPwaContextValue {
  const ctx = useContext(AdminPwaContext);
  if (!ctx) throw new Error("useAdminPwa must be used within AdminPwaProvider");
  return ctx;
}
