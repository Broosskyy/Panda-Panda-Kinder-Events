"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { ADMIN_BTN } from "@/lib/admin/buttons";

export interface CrmSendError {
  message: string;
  detail?: string;
  code?: string;
}

interface CrmSendModalProps {
  open: boolean;
  title: string;
  customerEmail?: string | null;
  sendToCustomer: boolean;
  copyToBusiness: boolean;
  loading?: boolean;
  error?: CrmSendError | null;
  onChangeSendToCustomer: (v: boolean) => void;
  onChangeCopyToBusiness: (v: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function CrmSendModal({
  open,
  title,
  customerEmail,
  sendToCustomer,
  copyToBusiness,
  loading,
  error,
  onChangeSendToCustomer,
  onChangeCopyToBusiness,
  onClose,
  onConfirm,
}: CrmSendModalProps) {
  const [showDetail, setShowDetail] = useState(false);
  const canSendToCustomer = Boolean(customerEmail?.trim());
  const canConfirm = (sendToCustomer && canSendToCustomer) || copyToBusiness;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  return (
    <div className="admin-modal-root" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="admin-modal-backdrop" onClick={onClose} aria-label="Schließen" />
      <div className="admin-modal-panel">
        <h2 className="font-heading text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-muted">
          Das PDF wird automatisch erstellt und als Anhang versendet
          {sendToCustomer && customerEmail ? ` an ${customerEmail}` : ""}
          {copyToBusiness ? " — mit Kopie an uns." : "."}
        </p>

        {!canSendToCustomer && sendToCustomer ? (
          <p className="mt-3 rounded-lg border border-accent-heart/25 bg-accent-heart/5 px-3 py-2 text-sm text-text-secondary" role="alert">
            Beim Kunden ist keine E-Mail-Adresse hinterlegt. Bitte Kunde bearbeiten oder nur „Kopie an uns“ wählen.
          </p>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-accent-heart/30 bg-accent-heart/10 px-4 py-3 text-sm text-text-primary" role="alert">
            <p className="font-semibold">{error.message}</p>
            <p className="mt-1 text-text-muted">
              Lösung: E-Mail-Einstellungen, Domain-Status und Empfänger-Adresse prüfen.
            </p>
            {error.detail ? (
              <div className="mt-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-xs font-medium text-text-muted hover:text-text-primary"
                  onClick={() => setShowDetail((v) => !v)}
                >
                  Technische Details
                  {showDetail ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {showDetail ? (
                  <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-bg-secondary p-2 text-xs text-text-muted">
                    {error.detail}
                  </pre>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={sendToCustomer}
              onChange={(e) => onChangeSendToCustomer(e.target.checked)}
              disabled={!canSendToCustomer}
            />
            <span>An Kunden senden{canSendToCustomer ? "" : " (keine E-Mail)"}</span>
          </label>
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={copyToBusiness}
              onChange={(e) => onChangeCopyToBusiness(e.target.checked)}
            />
            <span>Kopie an uns (interne E-Mail-Adresse)</span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <AdminButton variant="primary" onClick={onConfirm} disabled={loading || !canConfirm}>
            {loading ? "Wird gesendet…" : ADMIN_BTN.send}
          </AdminButton>
          <AdminButton variant="secondary" onClick={onClose} disabled={loading}>
            {ADMIN_BTN.cancel}
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
