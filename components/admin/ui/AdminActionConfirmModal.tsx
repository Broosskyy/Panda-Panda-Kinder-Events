"use client";

import { ShieldAlert } from "lucide-react";
import type { ActionConfirmPayload } from "@/lib/admin/action-feedback";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminOverlayModal } from "@/components/admin/ui/AdminOverlayModal";

interface AdminActionConfirmModalProps {
  open: boolean;
  payload: ActionConfirmPayload | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function AdminActionConfirmModal({
  open,
  payload,
  loading = false,
  onCancel,
  onConfirm,
}: AdminActionConfirmModalProps) {
  if (!payload) return null;

  return (
    <AdminOverlayModal
      open={open}
      onClose={onCancel}
      title={payload.title}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <AdminButton variant="secondary" onClick={onCancel} disabled={loading}>
            {payload.cancelLabel ?? "Abbrechen"}
          </AdminButton>
          <AdminButton
            variant={payload.destructive === false ? "primary" : "danger"}
            loading={loading}
            onClick={onConfirm}
          >
            {payload.confirmLabel ?? "Bestätigen"}
          </AdminButton>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <ShieldAlert
          className={`mt-0.5 h-6 w-6 shrink-0 ${payload.destructive === false ? "text-amber-600" : "text-red-600"}`}
          aria-hidden
        />
        <div>
          <p className="text-sm leading-relaxed text-text-secondary">{payload.message}</p>
          {payload.audited !== false ? (
            <p className="mt-2 text-xs text-text-muted">Diese Aktion wird protokolliert.</p>
          ) : null}
        </div>
      </div>
    </AdminOverlayModal>
  );
}
