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

export interface PwaDebugStatus {
  beforeInstallPrompt: boolean;
  manifestLoaded: boolean;
  serviceWorkerActive: boolean;
  standalone: boolean;
  installPromptAvailable: boolean;
  checkedAt: string;
}

interface AdminPwaContextValue {
  canInstall: boolean;
  showIosGuide: boolean;
  showManualGuide: boolean;
  showInstallCard: boolean;
  isInstalled: boolean;
  dismissed: boolean;
  debugStatus: PwaDebugStatus | null;
  install: () => Promise<PwaInstallOutcome>;
  dismiss: () => void;
  checkInstallStatus: () => Promise<PwaDebugStatus>;
  showInstallHelp: () => void;
  installHelpVisible: boolean;
}

const AdminPwaContext = createContext<AdminPwaContextValue | null>(null);

async function probePwaStatus(deferred: BeforeInstallPromptEvent | null): Promise<PwaDebugStatus> {
  let manifestLoaded = false;
  try {
    const res = await fetch("/admin/manifest.webmanifest", { cache: "no-store" });
    manifestLoaded = res.ok;
  } catch {
    manifestLoaded = false;
  }

  let serviceWorkerActive = false;
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.getRegistration("/admin");
      serviceWorkerActive = Boolean(reg?.active);
    } catch {
      serviceWorkerActive = false;
    }
  }

  const standalone = isStandalonePwa();
  const installPromptAvailable = Boolean(deferred);

  const status: PwaDebugStatus = {
    beforeInstallPrompt: installPromptAvailable,
    manifestLoaded,
    serviceWorkerActive,
    standalone,
    installPromptAvailable,
    checkedAt: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    console.info("[pwa] debug status", status);
  }

  return status;
}

export function AdminPwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [ios] = useState(() => isIosDevice());
  const [debugStatus, setDebugStatus] = useState<PwaDebugStatus | null>(null);
  const [installHelpVisible, setInstallHelpVisible] = useState(false);

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
      console.info("[pwa] beforeinstallprompt captured");
    };

    const onInstalled = () => {
      markPwaInstalled();
      setInstalled(true);
      setDeferred(null);
      console.info("[pwa] appinstalled");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    void probePwaStatus(null).then(setDebugStatus);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    void probePwaStatus(deferred).then(setDebugStatus);
  }, [deferred, installed]);

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

  const checkInstallStatus = useCallback(async () => {
    const status = await probePwaStatus(deferred);
    setDebugStatus(status);
    if (!deferred && !ios && !installed) {
      setInstallHelpVisible(true);
    }
    return status;
  }, [deferred, installed, ios]);

  const showInstallHelp = useCallback(() => {
    setInstallHelpVisible(true);
    setDismissed(false);
  }, []);

  const canInstall = Boolean(deferred) && !installed && !dismissed;
  const showIosGuide = ios && !installed && !dismissed;
  const showManualGuide = !installed && !dismissed && !canInstall && !showIosGuide;
  const showInstallCard = !installed && !dismissed;

  const value = useMemo<AdminPwaContextValue>(
    () => ({
      canInstall,
      showIosGuide,
      showManualGuide,
      showInstallCard,
      isInstalled: installed,
      dismissed,
      debugStatus,
      install,
      dismiss,
      checkInstallStatus,
      showInstallHelp,
      installHelpVisible,
    }),
    [
      canInstall,
      checkInstallStatus,
      debugStatus,
      dismiss,
      dismissed,
      install,
      installHelpVisible,
      installed,
      showInstallCard,
      showInstallHelp,
      showIosGuide,
      showManualGuide,
    ],
  );

  return <AdminPwaContext.Provider value={value}>{children}</AdminPwaContext.Provider>;
}

export function useAdminPwa(): AdminPwaContextValue {
  const ctx = useContext(AdminPwaContext);
  if (!ctx) throw new Error("useAdminPwa must be used within AdminPwaProvider");
  return ctx;
}
