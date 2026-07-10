"use client";

import type { ReactNode } from "react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { ADMIN_BTN } from "@/lib/admin/buttons";

type DialogAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  disabled?: boolean;
  loading?: boolean;
  hidden?: boolean;
};

interface AdminDialogFooterProps {
  /** Primary action — Speichern, Bestätigen, Verknüpfungen anzeigen */
  primary?: DialogAction;
  /** Secondary action — Archivieren, alternative confirm */
  secondary?: DialogAction;
  /** Destructive action — Löschen */
  danger?: DialogAction;
  /** Cancel — always last */
  cancel?: DialogAction;
  children?: ReactNode;
}

/**
 * Standard dialog footer order:
 * Primary → Secondary → Danger → Abbrechen (always last)
 */
export function AdminDialogFooter({ primary, secondary, danger, cancel, children }: AdminDialogFooterProps) {
  const actions = [primary, secondary, danger].filter(
    (action): action is DialogAction => Boolean(action && !action.hidden),
  );

  return (
    <div className="flex flex-col gap-2">
      {children}
      {actions.map((action) => (
        <AdminButton
          key={action.label}
          variant={action.variant ?? "secondary"}
          className="w-full min-h-11"
          onClick={action.onClick}
          disabled={action.disabled}
          loading={action.loading}
        >
          {action.label}
        </AdminButton>
      ))}
      {cancel ? (
        <AdminButton
          variant="ghost"
          className="w-full min-h-11"
          onClick={cancel.onClick}
          disabled={cancel.disabled}
        >
          {cancel.label}
        </AdminButton>
      ) : null}
    </div>
  );
}

export function saveCancelFooter(onSave: () => void, onCancel: () => void, saving = false) {
  return (
    <AdminDialogFooter
      primary={{ label: ADMIN_BTN.save, onClick: onSave, variant: "primary", loading: saving }}
      cancel={{ label: ADMIN_BTN.cancel, onClick: onCancel }}
    />
  );
}
