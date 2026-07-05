"use client";

import { AdminButton } from "@/components/admin/ui";

interface CrmSendModalProps {
  open: boolean;
  title: string;
  customerEmail?: string | null;
  sendToCustomer: boolean;
  copyToBusiness: boolean;
  loading?: boolean;
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
  onChangeSendToCustomer,
  onChangeCopyToBusiness,
  onClose,
  onConfirm,
}: CrmSendModalProps) {
  if (!open) return null;

  return (
    <div className="admin-modal-root" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="admin-modal-backdrop" onClick={onClose} aria-label="Schließen" />
      <div className="admin-modal-panel">
        <h2 className="font-heading text-lg font-semibold text-text-primary">{title}</h2>
        <p className="mt-2 text-sm text-text-muted">
          PDF wird als Anhang versendet{customerEmail ? ` an ${customerEmail}` : ""}.
        </p>

        <div className="mt-4 space-y-3">
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={sendToCustomer}
              onChange={(e) => onChangeSendToCustomer(e.target.checked)}
            />
            <span>An Kunden senden</span>
          </label>
          <label className="admin-checkbox-row">
            <input
              type="checkbox"
              checked={copyToBusiness}
              onChange={(e) => onChangeCopyToBusiness(e.target.checked)}
            />
            <span>Kopie an uns</span>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <AdminButton variant="primary" onClick={onConfirm} disabled={loading || !sendToCustomer}>
            {loading ? "Wird gesendet…" : "Jetzt senden"}
          </AdminButton>
          <AdminButton variant="secondary" onClick={onClose} disabled={loading}>
            Abbrechen
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
