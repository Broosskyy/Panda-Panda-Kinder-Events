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
import { getClientOnboardingSteps, type OnboardingStep } from "@/lib/admin/onboarding";

interface OnboardingContextValue {
  openWizard: () => void;
  isOpen: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function AdminOnboardingProvider({ children }: { children: ReactNode }) {
  const { status, identity, permissions } = useAdminSession();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [completed, setCompleted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [forcedOpen, setForcedOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const applyClientFallback = useCallback(() => {
    if (!identity) return;
    const clientSteps = getClientOnboardingSteps(permissions, identity.roleSlug);
    setSteps(clientSteps);
    setCompleted(false);
  }, [identity, permissions]);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/onboarding");
      const data = await res.json();
      if (res.ok) {
        const apiSteps = Array.isArray(data.steps) ? data.steps : [];
        setSteps(apiSteps.length > 0 ? apiSteps : getClientOnboardingSteps(permissions, identity!.roleSlug));
        setCompleted(Boolean(data.completed));
        return;
      }
      applyClientFallback();
    } catch {
      applyClientFallback();
    } finally {
      setLoaded(true);
    }
  }, [applyClientFallback, identity, permissions]);

  useEffect(() => {
    if (status !== "ready" || !identity) return;
    void loadStatus();
  }, [status, identity, loadStatus]);

  const shouldAutoOpen = loaded && !completed && steps.length > 0;
  const isOpen = forcedOpen || shouldAutoOpen;

  const finish = useCallback(async () => {
    try {
      await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
    } catch {
      // still close locally
    }
    setCompleted(true);
    setForcedOpen(false);
    setStepIndex(0);
  }, []);

  const openWizard = useCallback(async () => {
    try {
      await fetch("/api/admin/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restart" }),
      });
    } catch {
      // continue with local open
    }
    setCompleted(false);
    setForcedOpen(true);
    setStepIndex(0);
    if (identity) {
      setSteps(getClientOnboardingSteps(permissions, identity.roleSlug));
    }
    await loadStatus();
  }, [identity, loadStatus, permissions]);

  const closeWizard = useCallback(() => {
    setForcedOpen(false);
    if (!completed) void finish();
  }, [completed, finish]);

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
          onSkip={() => void finish()}
          onClose={closeWizard}
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
