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
import { useAdminSession } from "@/components/admin/AdminSessionProvider";
import { AdminOnboardingWizard } from "@/components/admin/AdminOnboardingWizard";
import {
  getClientOnboardingSteps,
  ONBOARDING_SESSION_DISMISS_KEY,
  type OnboardingStep,
} from "@/lib/admin/onboarding";

interface OnboardingContextValue {
  openWizard: () => void;
  isOpen: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

interface AdminOnboardingProviderProps {
  children: ReactNode;
  initialCompleted?: boolean;
}

export function AdminOnboardingProvider({
  children,
  initialCompleted = false,
}: AdminOnboardingProviderProps) {
  const { status, identity, permissions } = useAdminSession();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [completed, setCompleted] = useState(initialCompleted);
  const [sessionDismissed, setSessionDismissed] = useState(false);
  const [forcedOpen, setForcedOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [statusSynced, setStatusSynced] = useState(false);

  useEffect(() => {
    if (status !== "ready" || !identity) return;
    setSteps(getClientOnboardingSteps(permissions, identity.roleSlug));
    setSessionDismissed(sessionStorage.getItem(ONBOARDING_SESSION_DISMISS_KEY) === "1");
    setStatusSynced(true);
  }, [status, identity, permissions]);

  useEffect(() => {
    if (status !== "ready" || !identity) return;
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/admin/onboarding");
        const data = await res.json();
        if (cancelled || !res.ok) return;
        setCompleted(Boolean(data.completed));
        const apiSteps = Array.isArray(data.steps) ? data.steps : [];
        if (apiSteps.length > 0) setSteps(apiSteps);
      } catch {
        // Client steps remain usable immediately.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, identity]);

  const dismissSession = useCallback(() => {
    sessionStorage.setItem(ONBOARDING_SESSION_DISMISS_KEY, "1");
    setSessionDismissed(true);
    setForcedOpen(false);
    setStepIndex(0);
  }, []);

  const finish = useCallback(async () => {
    try {
      await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
    } catch {
      // Close locally even if the network call fails.
    }
    sessionStorage.removeItem(ONBOARDING_SESSION_DISMISS_KEY);
    setCompleted(true);
    setSessionDismissed(false);
    setForcedOpen(false);
    setStepIndex(0);
  }, []);

  const openWizard = useCallback(async () => {
    sessionStorage.removeItem(ONBOARDING_SESSION_DISMISS_KEY);
    setSessionDismissed(false);
    setCompleted(false);
    setForcedOpen(true);
    setStepIndex(0);
    if (identity) {
      setSteps(getClientOnboardingSteps(permissions, identity.roleSlug));
    }
    try {
      await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      });
    } catch {
      // Local open still works.
    }
  }, [identity, permissions]);

  const shouldAutoOpen = statusSynced && !completed && !sessionDismissed && steps.length > 0;
  const isOpen = forcedOpen || shouldAutoOpen;

  const value = useMemo(() => ({ openWizard, isOpen }), [openWizard, isOpen]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {status === "ready" && identity && isOpen && steps.length > 0 ? (
        <AdminOnboardingWizard
          steps={steps}
          stepIndex={stepIndex}
          onStepIndexChange={setStepIndex}
          onComplete={() => void finish()}
          onDismissPermanent={() => void finish()}
          onClose={dismissSession}
          onSkip={dismissSession}
          displayName={identity.displayName}
        />
      ) : null}
    </OnboardingContext.Provider>
  );
}

export function useAdminOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useAdminOnboarding must be used within AdminOnboardingProvider");
  return ctx;
}
