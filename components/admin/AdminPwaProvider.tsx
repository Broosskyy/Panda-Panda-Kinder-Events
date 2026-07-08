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
  clearDeferredPrompt,
  clearPwaSessionClosed,
  isAndroidDevice,
  isIosDevice,
  markPwaDontShowAgain,
  markPwaInstalled,
  markPwaSessionClosed,
  probePwaInstallability,
  readPwaDontShowAgain,
  readPwaSessionClosed,
  registerAdminServiceWorker,
  resolvePwaInstalled,
  storeDeferredPrompt,
  supportsNativePwaInstall,
  takeEarlyCapturedPrompt,
  type BeforeInstallPromptEvent,
  type PwaInstallOutcome,
  type PwaProbeResult,
} from "@/lib/admin/pwa-install";

export type PwaInstallFeedback =
  | { type: "idle" }
  | { type: "started" }
  | { type: "accepted" }
  | { type: "dismissed" }
  | { type: "unavailable" };

interface AdminPwaContextValue {
  canInstall: boolean;
  showIosGuide: boolean;
  showAndroidGuide: boolean;
  showUnsupportedGuide: boolean;
  showInstallCard: boolean;
  sessionClosed: boolean;
  isInstalled: boolean;
  hiddenPermanently: boolean;
  probeResult: PwaProbeResult | null;
  installFeedback: PwaInstallFeedback;
  helpOpen: boolean;
  install: () => Promise<PwaInstallOutcome>;
  closeCard: () => void;
  dontShowAgain: () => void;
  checkInstallStatus: () => Promise<PwaProbeResult>;
  openInstallHelp: () => void;
  closeInstallHelp: () => void;
  reopenInstallCard: () => void;
}

const AdminPwaContext = createContext<AdminPwaContextValue | null>(null);

export function AdminPwaProvider({ children }: { children: ReactNode }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hiddenPermanently, setHiddenPermanently] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [ios] = useState(() => isIosDevice());
  const [android] = useState(() => isAndroidDevice());
  const [probeResult, setProbeResult] = useState<PwaProbeResult | null>(null);
  const [forceShowCard, setForceShowCard] = useState(false);
  const [installFeedback, setInstallFeedback] = useState<PwaInstallFeedback>({ type: "idle" });
  const [helpOpen, setHelpOpen] = useState(false);

  const refreshProbe = useCallback(async (prompt: BeforeInstallPromptEvent | null) => {
    const status = await probePwaInstallability(prompt);
    setProbeResult(status);
    if (status.state === "installed") setInstalled(true);
    return status;
  }, []);

  useEffect(() => {
    setInstalled(resolvePwaInstalled());
    setHiddenPermanently(readPwaDontShowAgain());
    setSessionClosed(readPwaSessionClosed());

    const early = takeEarlyCapturedPrompt();
    if (early) setDeferred(early);

    void registerAdminServiceWorker().then(() => refreshProbe(early));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      storeDeferredPrompt(promptEvent);
      setDeferred(promptEvent);
      void refreshProbe(promptEvent);
    };

    const onInstalled = () => {
      markPwaInstalled();
      setInstalled(true);
      setDeferred(null);
      clearDeferredPrompt();
      setForceShowCard(false);
      setInstallFeedback({ type: "accepted" });
      void refreshProbe(null);
    };

    const onPromptAvailable = () => {
      const prompt = takeEarlyCapturedPrompt();
      if (prompt) setDeferred(prompt);
      void refreshProbe(prompt);
    };

    const onExternalInstalled = () => onInstalled();

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("pb-pwa-prompt-available", onPromptAvailable);
    window.addEventListener("pb-pwa-installed", onExternalInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("pb-pwa-prompt-available", onPromptAvailable);
      window.removeEventListener("pb-pwa-installed", onExternalInstalled);
    };
  }, [refreshProbe]);

  useEffect(() => {
    void refreshProbe(deferred);
  }, [deferred, installed, refreshProbe]);

  const install = useCallback(async (): Promise<PwaInstallOutcome> => {
    const promptEvent = deferred ?? takeEarlyCapturedPrompt();
    if (!promptEvent) {
      setInstallFeedback({ type: "unavailable" });
      return "unavailable";
    }
    setInstallFeedback({ type: "started" });
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") {
        markPwaInstalled();
        setInstalled(true);
        setForceShowCard(false);
        setInstallFeedback({ type: "accepted" });
      } else {
        setInstallFeedback({ type: "dismissed" });
      }
      setDeferred(null);
      clearDeferredPrompt();
      void refreshProbe(null);
      return outcome;
    } catch (err) {
      console.warn("[pwa] install failed", err);
      setInstallFeedback({ type: "unavailable" });
      return "unavailable";
    }
  }, [deferred, refreshProbe]);

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
    await registerAdminServiceWorker();
    return refreshProbe(currentDeferred);
  }, [deferred, refreshProbe]);

  const openInstallHelp = useCallback(() => {
    setHelpOpen(true);
  }, []);

  const closeInstallHelp = useCallback(() => {
    setHelpOpen(false);
  }, []);

  const reopenInstallCard = useCallback(() => {
    clearPwaSessionClosed();
    setSessionClosed(false);
    setForceShowCard(true);
  }, []);

  const canInstall = Boolean(deferred ?? takeEarlyCapturedPrompt()) && !installed;
  const showIosGuide = ios && !installed && !canInstall;
  const showAndroidGuide = android && !installed && !canInstall && supportsNativePwaInstall();
  const showUnsupportedGuide =
    typeof navigator !== "undefined" && !("serviceWorker" in navigator) && !installed;
  const showInstallCard = !installed && !hiddenPermanently && (!sessionClosed || forceShowCard);

  const value = useMemo<AdminPwaContextValue>(
    () => ({
      canInstall,
      showIosGuide,
      showAndroidGuide,
      showUnsupportedGuide,
      showInstallCard,
      sessionClosed,
      isInstalled: installed,
      hiddenPermanently,
      probeResult,
      installFeedback,
      helpOpen,
      install,
      closeCard,
      dontShowAgain,
      checkInstallStatus,
      openInstallHelp,
      closeInstallHelp,
      reopenInstallCard,
    }),
    [
      canInstall,
      checkInstallStatus,
      closeCard,
      closeInstallHelp,
      dontShowAgain,
      helpOpen,
      hiddenPermanently,
      install,
      installFeedback,
      installed,
      openInstallHelp,
      probeResult,
      reopenInstallCard,
      sessionClosed,
      showAndroidGuide,
      showInstallCard,
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
