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
  isAndroidDevice,
  supportsNativePwaInstall,
  markPwaDontShowAgain,
  markPwaInstalled,
  markPwaSessionClosed,
  readPwaDontShowAgain,
  readPwaSessionClosed,
  resolvePwaInstalled,
  takeEarlyCapturedPrompt,
  storeDeferredPrompt,
  clearDeferredPrompt,
  type BeforeInstallPromptEvent,
  type PwaInstallOutcome,
} from "@/lib/admin/pwa-install";

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
  showAndroidGuide: boolean;
  showUnsupportedGuide: boolean;
  showInstallCard: boolean;
  isInstalled: boolean;
  hiddenPermanently: boolean;
  debugStatus: PwaDebugStatus | null;
  install: () => Promise<PwaInstallOutcome>;
  closeCard: () => void;
  dontShowAgain: () => void;
  checkInstallStatus: () => Promise<PwaDebugStatus>;
  showInstallHelp: () => void;
  reopenInstallCard: () => void;
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

  const standalone = resolvePwaInstalled();
  const installPromptAvailable = Boolean(deferred);

  return {
    beforeInstallPrompt: installPromptAvailable,
    manifestLoaded,
    serviceWorkerActive,
    standalone,
    installPromptAvailable,
    checkedAt: new Date().toISOString(),
  };
}

export function AdminPwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hiddenPermanently, setHiddenPermanently] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [ios] = useState(() => isIosDevice());
  const [android] = useState(() => isAndroidDevice());
  const [debugStatus, setDebugStatus] = useState<PwaDebugStatus | null>(null);
  const [forceShowCard, setForceShowCard] = useState(false);

  useEffect(() => {
    setInstalled(resolvePwaInstalled());
    setHiddenPermanently(readPwaDontShowAgain());
    setSessionClosed(readPwaSessionClosed());

    const early = takeEarlyCapturedPrompt();
    if (early) setDeferred(early);

    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/admin-sw.js", { scope: "/admin" })
      .catch((err) => console.warn("[pwa] registration failed", err));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      storeDeferredPrompt(promptEvent);
      setDeferred(promptEvent);
    };

    const onInstalled = () => {
      markPwaInstalled();
      setInstalled(true);
      setDeferred(null);
      clearDeferredPrompt();
      setForceShowCard(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);

    void probePwaStatus(early).then(setDebugStatus);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    void probePwaStatus(deferred).then(setDebugStatus);
  }, [deferred, installed]);

  const install = useCallback(async (): Promise<PwaInstallOutcome> => {
    const promptEvent = deferred ?? takeEarlyCapturedPrompt();
    if (!promptEvent) return "unavailable";
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        markPwaInstalled();
        setInstalled(true);
        setForceShowCard(false);
      }
      setDeferred(null);
      clearDeferredPrompt();
      return outcome;
    } catch (err) {
      console.warn("[pwa] install failed", err);
      return "unavailable";
    }
  }, [deferred]);

  const closeCard = useCallback(() => {
    markPwaSessionClosed();
    setSessionClosed(true);
    setForceShowCard(false);
  }, []);

  const dontShowAgain = useCallback(() => {
    markPwaDontShowAgain();
    setHiddenPermanently(true);
    setForceShowCard(false);
  }, []);

  const checkInstallStatus = useCallback(async () => {
    const currentDeferred = deferred ?? takeEarlyCapturedPrompt();
    if (currentDeferred && !deferred) setDeferred(currentDeferred);
    const status = await probePwaStatus(currentDeferred);
    setDebugStatus(status);
    if (status.standalone) {
      setInstalled(true);
    }
    return status;
  }, [deferred]);

  const showInstallHelp = useCallback(() => {
    setForceShowCard(true);
    setSessionClosed(false);
    import("@/lib/admin/pwa-install").then(({ clearPwaSessionClosed }) => clearPwaSessionClosed());
  }, []);

  const reopenInstallCard = useCallback(() => {
    setForceShowCard(true);
    setSessionClosed(false);
    import("@/lib/admin/pwa-install").then(({ clearPwaSessionClosed }) => clearPwaSessionClosed());
  }, []);

  const canInstall = Boolean(deferred ?? takeEarlyCapturedPrompt()) && !installed;
  const showIosGuide = ios && !installed;
  const showAndroidGuide = android && !installed && !canInstall && supportsNativePwaInstall();
  const showUnsupportedGuide =
    typeof navigator !== "undefined" && !("serviceWorker" in navigator) && !installed;
  const showInstallCard =
    !installed && !hiddenPermanently && (!sessionClosed || forceShowCard);

  const value = useMemo<AdminPwaContextValue>(
    () => ({
      canInstall,
      showIosGuide,
      showAndroidGuide,
      showUnsupportedGuide,
      showInstallCard,
      isInstalled: installed,
      hiddenPermanently,
      debugStatus,
      install,
      closeCard,
      dontShowAgain,
      checkInstallStatus,
      showInstallHelp,
      reopenInstallCard,
    }),
    [
      canInstall,
      checkInstallStatus,
      closeCard,
      debugStatus,
      dontShowAgain,
      hiddenPermanently,
      install,
      installed,
      reopenInstallCard,
      showAndroidGuide,
      showInstallCard,
      showInstallHelp,
      showIosGuide,
      showUnsupportedGuide,
    ],
  );

  return <AdminPwaContext.Provider value={value}>{children}</AdminPwaContext.Provider>;
}

export function useAdminPwa(): AdminPwaContextValue {
  const ctx = useContext(AdminPwaContext);
  if (!ctx) throw new Error("useAdminPwa must be used within AdminPwaProvider");
  return ctx;
}
