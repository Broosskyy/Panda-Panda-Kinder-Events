"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import type { ActionResultPayload } from "@/lib/admin/action-feedback";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { AdminOverlayModal } from "@/components/admin/ui/AdminOverlayModal";

interface AdminActionResultModalProps {
  open: boolean;
  payload: ActionResultPayload | null;
  onClose: () => void;
}

function StatusIcon({ status }: { status: ActionResultPayload["status"] }) {
  if (status === "success") return <CheckCircle2 className="h-6 w-6 text-[#2d5a3a]" aria-hidden />;
  if (status === "warning") return <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden />;
  if (status === "error") return <XCircle className="h-6 w-6 text-red-600" aria-hidden />;
  return <Info className="h-6 w-6 text-primary" aria-hidden />;
}

export function AdminActionResultModal({ open, payload, onClose }: AdminActionResultModalProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!payload) return null;

  return (
    <AdminOverlayModal
      open={open}
      onClose={onClose}
      title={payload.title}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {payload.secondaryAction ? (
            <AdminButton variant="secondary" onClick={payload.secondaryAction.onClick}>
              {payload.secondaryAction.label}
            </AdminButton>
          ) : null}
          <AdminButton variant="primary" onClick={onClose}>
            {payload.primaryLabel ?? "OK"}
          </AdminButton>
        </div>
      }
    >
      <div className="flex items-start gap-3">
        <StatusIcon status={payload.status} />
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-text-secondary">{payload.message}</p>
          {payload.details ? (
            <div className="mt-3">
              <button
                type="button"
                className="text-xs font-medium text-primary underline"
                onClick={() => setDetailsOpen((v) => !v)}
              >
                {detailsOpen ? "Details ausblenden" : "Details anzeigen"}
              </button>
              {detailsOpen ? (
                <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-bg-secondary/70 p-2 text-xs text-text-muted">
                  {payload.details}
                </pre>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </AdminOverlayModal>
  );
}
