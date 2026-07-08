"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { resolveAdminIcon } from "@/lib/admin/icons";
import type { OnboardingStep } from "@/lib/admin/onboarding";

interface AdminOnboardingWizardProps {
  steps: OnboardingStep[];
  stepIndex: number;
  onStepIndexChange: (index: number) => void;
  onComplete: () => void;
  onDismissPermanent: () => void;
  onCloseSession: () => void;
  onSkipToEnd: () => void;
  displayName: string;
}

export function AdminOnboardingWizard({
  steps,
  stepIndex,
  onStepIndexChange,
  onComplete,
  onDismissPermanent,
  onCloseSession,
  onSkipToEnd,
  displayName,
}: AdminOnboardingWizardProps) {
  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const progress = ((stepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-admin-onboarding", "open");
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      root.removeAttribute("data-admin-onboarding");
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, []);

  if (!step) return null;

  const Icon = resolveAdminIcon(step.iconKey ?? "Sparkles");
  const title =
    step.id === "welcome" && displayName
      ? `${step.title}, ${displayName.split(" ")[0]}!`
      : step.title;

  const content = (
    <div className="admin-onboarding-v2-root" role="presentation">
      <div className="admin-onboarding-v2-backdrop" aria-hidden="true" />

      <div
        className="admin-onboarding-v2-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-onboarding-v2-title"
        aria-describedby="admin-onboarding-v2-desc"
      >
        <header className="admin-onboarding-v2-header">
          <div className="admin-onboarding-v2-header-left">
            <div className="admin-onboarding-v2-icon-wrap" aria-hidden>
              <Icon className="h-5 w-5" />
            </div>
            <p className="admin-onboarding-v2-step-label">
              Schritt {stepIndex + 1} von {steps.length}
            </p>
          </div>
          <button
            type="button"
            className="admin-onboarding-v2-close"
            onClick={onCloseSession}
            aria-label="Tutorial schließen"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="admin-onboarding-v2-progress" aria-hidden>
          <div className="admin-onboarding-v2-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="admin-onboarding-v2-body">
          <h2 id="admin-onboarding-v2-title" className="admin-onboarding-v2-title">
            {title}
          </h2>
          <p id="admin-onboarding-v2-desc" className="admin-onboarding-v2-text">
            {step.body}
          </p>
          {step.bullets?.length ? (
            <ul className="admin-onboarding-v2-bullets">
              {step.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {step.href ? (
            <Link href={step.href} className="admin-onboarding-v2-link" onClick={onCloseSession}>
              {step.hrefLabel ?? "Bereich öffnen"} →
            </Link>
          ) : null}
        </div>

        <footer className="admin-onboarding-v2-footer">
          <div className={`admin-onboarding-v2-actions-primary ${isFirst ? "admin-onboarding-v2-actions-single" : ""}`}>
            {!isFirst ? (
              <AdminButton
                variant="secondary"
                className="admin-onboarding-v2-btn"
                icon={<ChevronLeft className="h-4 w-4" />}
                onClick={() => onStepIndexChange(stepIndex - 1)}
              >
                Zurück
              </AdminButton>
            ) : null}
            {isLast ? (
              <AdminButton variant="primary" className="admin-onboarding-v2-btn" onClick={onComplete}>
                Fertig
              </AdminButton>
            ) : (
              <AdminButton
                variant="primary"
                className="admin-onboarding-v2-btn"
                icon={<ChevronRight className="h-4 w-4" />}
                onClick={() => onStepIndexChange(stepIndex + 1)}
              >
                Weiter
              </AdminButton>
            )}
          </div>
          <div className="admin-onboarding-v2-actions-secondary">
            <button type="button" className="admin-onboarding-v2-text-btn" onClick={onSkipToEnd}>
              Überspringen
            </button>
            <button type="button" className="admin-onboarding-v2-text-btn" onClick={onDismissPermanent}>
              Nicht erneut anzeigen
            </button>
          </div>
        </footer>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
