"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  buildPwaDebugStatus,
  clearDeferredPrompt,
  clearPwaSessionClosed,
  detectPwaBrowser,
  getBrowserInstallGuide,
  isAndroidDevice,
  isIosDevice,
  markPwaDontShowAgain,
  markPwaInstalled,
  markPwaSessionClosed,
  probePwaInstallability,
  readPwaDontShowAgain,
  readPwaSessionClosed,
  registerAdminServiceWorker,
  resetPwaInstallHints,
  resetPwaInstallCaches,
  resolvePwaInstalled,
  clearPwaInstalledFlag,
  storeDeferredPrompt,
  supportsNativePwaInstall,
  takeEarlyCapturedPrompt,
  type BeforeInstallPromptEvent,
  type BrowserInstallGuide,
  type PwaBrowserInfo,
  type PwaDebugStatus,
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
  browserInfo: PwaBrowserInfo;
  installGuide: BrowserInstallGuide;
  showIosGuide: boolean;
  showAndroidGuide: boolean;
  showUnsupportedGuide: boolean;
  showInstallCard: boolean;
  sessionClosed: boolean;
  isInstalled: boolean;
  hiddenPermanently: boolean;
  probeResult: PwaProbeResult | null;
  debugStatus: PwaDebugStatus | null;
  installFeedback: PwaInstallFeedback;
  helpOpen: boolean;
  install: () => Promise<PwaInstallOutcome>;
  closeCard: () => void;
  dontShowAgain: () => void;
  checkInstallStatus: () => Promise<PwaProbeResult>;
  resetInstallHints: () => void;
  openInstallHelp: () => void;
  closeInstallHelp: () => void;
  reopenInstallCard: () => void;
}

const AdminPwaContext = createContext<AdminPwaContextValue | null>(null);

function syncDeferredFromWindow(): BeforeInstallPromptEvent | null {
  return takeEarlyCapturedPrompt();
}

export function AdminPwaProvider({ children }: { children: ReactNode }) {
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [hiddenPermanently, setHiddenPermanently] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [browserInfo] = useState(() => detectPwaBrowser());
  const [installGuide] = useState(() => getBrowserInstallGuide(detectPwaBrowser().id));
  const [ios] = useState(() => isIosDevice());
  const [android] = useState(() => isAndroidDevice());
  const [probeResult, setProbeResult] = useState<PwaProbeResult | null>(null);
  const [debugStatus, setDebugStatus] = useState<PwaDebugStatus | null>(null);
  const [forceShowCard, setForceShowCard] = useState(false);
  const [installFeedback, setInstallFeedback] = useState<PwaInstallFeedback>({ type: "idle" });
  const [helpOpen, setHelpOpen] = useState(false);

  const promptDismissedRecently = installFeedback.type === "dismissed";

  const applyDeferred = useCallback((prompt: BeforeInstallPromptEvent | null) => {
    deferredRef.current = prompt;
    setDeferred(prompt);
  }, []);

  const refreshProbe = useCallback(
    async (prompt: BeforeInstallPromptEvent | null) => {
      const status = await probePwaInstallability(prompt);
      setProbeResult(status);
      const debug = await buildPwaDebugStatus(status, {
        promptDismissedRecently,
        canInstall: Boolean(prompt),
      });
      setDebugStatus(debug);
      if (status.state === "installed") setInstalled(true);
      return status;
    },
    [promptDismissedRecently],
  );

  useEffect(() => {
    setInstalled(resolvePwaInstalled());
    setHiddenPermanently(readPwaDontShowAgain());
    setSessionClosed(readPwaSessionClosed());

    const early = syncDeferredFromWindow();
    if (early) applyDeferred(early);

    void registerAdminServiceWorker().then(() => refreshProbe(early));

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      clearPwaInstalledFlag();
      setInstalled(false);
      storeDeferredPrompt(promptEvent);
      applyDeferred(promptEvent);
      void refreshProbe(promptEvent);
    };

    const onInstalled = () => {
      markPwaInstalled();
      setInstalled(true);
      applyDeferred(null);
      clearDeferredPrompt();
      setForceShowCard(false);
      setInstallFeedback({ type: "accepted" });
      void refreshProbe(null);
    };

    const onPromptAvailable = () => {
      const prompt = syncDeferredFromWindow();
      if (prompt) applyDeferred(prompt);
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
  }, [applyDeferred, refreshProbe]);

  useEffect(() => {
    void refreshProbe(deferredRef.current);
  }, [deferred, installed, refreshProbe]);

  const install = useCallback(async (): Promise<PwaInstallOutcome> => {
    const promptEvent = deferredRef.current ?? syncDeferredFromWindow();
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
      applyDeferred(null);
      clearDeferredPrompt();
      void refreshProbe(null);
      return outcome;
    } catch (err) {
      console.warn("[pwa] install failed", err);
      setInstallFeedback({ type: "unavailable" });
      return "unavailable";
    }
  }, [applyDeferred, refreshProbe]);

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
    const currentDeferred = deferredRef.current ?? syncDeferredFromWindow();
    if (currentDeferred) applyDeferred(currentDeferred);
    await registerAdminServiceWorker();
    return refreshProbe(currentDeferred);
  }, [applyDeferred, refreshProbe]);

  const resetInstallHints = useCallback(() => {
    resetPwaInstallHints();
    void resetPwaInstallCaches();
    setHiddenPermanently(false);
    setSessionClosed(false);
    setForceShowCard(true);
    setInstallFeedback({ type: "idle" });
    void registerAdminServiceWorker().then(() => refreshProbe(deferredRef.current));
  }, [refreshProbe]);

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

  const canInstall = Boolean(deferredRef.current ?? syncDeferredFromWindow()) && !installed;
  const showIosGuide = ios && !installed && !canInstall;
  const showAndroidGuide = android && !installed && !canInstall && supportsNativePwaInstall();
  const showUnsupportedGuide =
    typeof navigator !== "undefined" && !("serviceWorker" in navigator) && !installed;
  const showInstallCard = !installed && !hiddenPermanently && (!sessionClosed || forceShowCard);

  const value = useMemo<AdminPwaContextValue>(
    () => ({
      canInstall,
      browserInfo,
      installGuide,
      showIosGuide,
      showAndroidGuide,
      showUnsupportedGuide,
      showInstallCard,
      sessionClosed,
      isInstalled: installed,
      hiddenPermanently,
      probeResult,
      debugStatus,
      installFeedback,
      helpOpen,
      install,
      closeCard,
      dontShowAgain,
      checkInstallStatus,
      resetInstallHints,
      openInstallHelp,
      closeInstallHelp,
      reopenInstallCard,
    }),
    [
      browserInfo,
      canInstall,
      checkInstallStatus,
      closeCard,
      closeInstallHelp,
      debugStatus,
      dontShowAgain,
      helpOpen,
      hiddenPermanently,
      install,
      installFeedback,
      installGuide,
      installed,
      openInstallHelp,
      probeResult,
      reopenInstallCard,
      resetInstallHints,
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
