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
import type { OnboardingStep } from "@/lib/admin/onboarding";

interface OnboardingContextValue {
  openWizard: () => void;
  isOpen: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function AdminOnboardingProvider({ children }: { children: ReactNode }) {
  const { status, identity } = useAdminSession();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [completed, setCompleted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [forcedOpen, setForcedOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/onboarding");
      const data = await res.json();
      if (!res.ok) return;
      setSteps(Array.isArray(data.steps) ? data.steps : []);
      setCompleted(Boolean(data.completed));
    } catch {
      setCompleted(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (status !== "ready") return;
    void loadStatus();
  }, [status, loadStatus]);

  const shouldAutoOpen = loaded && !completed && !forcedOpen && steps.length > 0;
  const isOpen = forcedOpen || shouldAutoOpen;

  const finish = useCallback(async () => {
    await fetch("/api/admin/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    });
    setCompleted(true);
    setForcedOpen(false);
    setStepIndex(0);
  }, []);

  const openWizard = useCallback(async () => {
    await fetch("/api/admin/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restart" }),
    });
    setCompleted(false);
    setForcedOpen(true);
    setStepIndex(0);
    await loadStatus();
  }, [loadStatus]);

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
