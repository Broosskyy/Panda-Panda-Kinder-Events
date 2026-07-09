"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminOverlayModal } from "@/components/admin/ui/AdminOverlayModal";

interface CustomerPermanentDeleteModalProps {
  open: boolean;
  customerName: string;
  reasons: string[];
  loading?: boolean;
  onClose: () => void;
  onConfirm: (confirmText: string) => void;
}

export function CustomerPermanentDeleteModal({
  open,
  customerName,
  reasons,
  loading = false,
  onClose,
  onConfirm,
}: CustomerPermanentDeleteModalProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <AdminOverlayModal
      open={open}
      onClose={handleClose}
      title="Kunde endgültig löschen"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <AdminButton variant="secondary" className="min-h-11 w-full sm:w-auto" onClick={handleClose} disabled={loading}>
            Abbrechen
          </AdminButton>
          <AdminButton
            variant="danger"
            className="min-h-11 w-full sm:w-auto"
            loading={loading}
            disabled={confirmText.trim() !== "LÖSCHEN"}
            onClick={() => onConfirm(confirmText.trim())}
          >
            Endgültig löschen
          </AdminButton>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-600" aria-hidden />
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Sie löschen <strong className="text-text-primary">{customerName}</strong> dauerhaft. Diese Aktion
            kann nicht rückgängig gemacht werden.
          </p>
          {reasons.length > 0 ? (
            <ul className="space-y-1 text-sm text-accent-heart">
              {reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-muted">Keine blockierenden Verknüpfungen mehr vorhanden.</p>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-muted">
              Zur Bestätigung „LÖSCHEN“ eingeben
            </span>
            <input
              className="admin-input w-full"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="LÖSCHEN"
              autoComplete="off"
            />
          </label>
          <p className="text-xs text-text-muted">Diese Aktion wird im Aktivitätsprotokoll festgehalten.</p>
        </div>
      </div>
    </AdminOverlayModal>
  );
}
