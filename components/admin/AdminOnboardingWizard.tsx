"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import type { OnboardingStep } from "@/lib/admin/onboarding";

interface AdminOnboardingWizardProps {
  steps: OnboardingStep[];
  stepIndex: number;
  onStepIndexChange: (index: number) => void;
  onComplete: () => void;
  onSkip: () => void;
  onClose: () => void;
  displayName: string;
}

export function AdminOnboardingWizard({
  steps,
  stepIndex,
  onStepIndexChange,
  onComplete,
  onSkip,
  onClose,
  displayName,
}: AdminOnboardingWizardProps) {
  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  if (!step) return null;

  const title =
    step.id === "welcome" && displayName
      ? `${step.title}, ${displayName.split(" ")[0]}!`
      : step.title;

  return (
    <div className="admin-onboarding-root" role="dialog" aria-modal="true" aria-labelledby="admin-onboarding-title">
      <button type="button" className="admin-onboarding-backdrop" onClick={onClose} aria-label="Tutorial schließen" />
      <div className="admin-onboarding-panel">
        <div className="admin-onboarding-header">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
            <span>
              Schritt {stepIndex + 1} von {steps.length}
            </span>
          </div>
          <button type="button" className="admin-icon-btn" onClick={onClose} aria-label="Schließen">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="admin-onboarding-progress" aria-hidden>
          <div className="admin-onboarding-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="admin-onboarding-body">
          <h2 id="admin-onboarding-title" className="admin-onboarding-title">
            {title}
          </h2>
          <p className="admin-onboarding-text">{step.body}</p>
          {step.href ? (
            <Link href={step.href} className="admin-onboarding-link" onClick={onClose}>
              {step.hrefLabel ?? "Bereich öffnen"} →
            </Link>
          ) : null}
        </div>

        <div className="admin-onboarding-footer">
          <div className="flex flex-wrap gap-2">
            {!isFirst ? (
              <AdminButton
                variant="secondary"
                icon={<ChevronLeft className="h-4 w-4" />}
                onClick={() => onStepIndexChange(stepIndex - 1)}
              >
                Zurück
              </AdminButton>
            ) : null}
            {isLast ? (
              <AdminButton variant="primary" onClick={onComplete}>
                Fertig
              </AdminButton>
            ) : (
              <AdminButton
                variant="primary"
                icon={<ChevronRight className="h-4 w-4" />}
                onClick={() => onStepIndexChange(stepIndex + 1)}
              >
                Weiter
              </AdminButton>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" className="admin-onboarding-text-btn" onClick={onSkip}>
              Überspringen
            </button>
            <button type="button" className="admin-onboarding-text-btn" onClick={onSkip}>
              Nicht erneut anzeigen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
