"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";
import { AdminFormField } from "@/components/admin/ui/AdminFormField";
import { ADMIN_BTN } from "@/lib/admin/buttons";

interface CriticalActionModalProps {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: (payload: { confirmPassword?: string }) => Promise<void>;
  loading?: boolean;
  destructive?: boolean;
}

export function CriticalActionModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  loading = false,
  destructive = true,
}: CriticalActionModalProps) {
  const [password, setPassword] = useState("");

  if (!open) return null;

  const handleConfirm = async () => {
    await onConfirm({ confirmPassword: password });
    setPassword("");
  };

  return (
    <div className="admin-overlay-modal-root" role="dialog" aria-modal="true" aria-labelledby="critical-action-title">
      <button type="button" className="admin-overlay-modal-backdrop" onClick={onCancel} aria-label="Schließen" />
      <div className={`admin-overlay-modal-panel relative z-10 w-full max-w-md p-6 ${destructive ? "admin-modal-danger" : "admin-modal-warning"}`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className={`mt-0.5 h-6 w-6 shrink-0 ${destructive ? "text-[var(--admin-status-danger)]" : "text-[var(--admin-status-warning)]"}`} aria-hidden />
          <div>
            <h2 id="critical-action-title" className="admin-overlay-modal-title">
              {title}
            </h2>
            <p className="mt-2 text-sm admin-text-muted">{description}</p>
            <p className="mt-2 text-xs admin-text-muted">Diese Aktion wird im Aktivitätsprotokoll gespeichert.</p>
          </div>
        </div>

        <AdminFormField
          label="Passwort zur Bestätigung"
          required
          hint="Nur berechtigte Admins können diese Aktion ausführen."
          className="mt-4"
        >
          <input
            className="admin-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </AdminFormField>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <AdminButton variant="secondary" onClick={onCancel} disabled={loading}>
            {ADMIN_BTN.cancel}
          </AdminButton>
          <AdminButton
            variant={destructive ? "danger" : "primary"}
            loading={loading}
            onClick={() => void handleConfirm()}
            disabled={!password.trim()}
          >
            Sicher bestätigen
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

export function withCriticalConfirmation<T extends object>(
  payload: T,
  confirmation: { confirmPassword?: string },
): T & { confirmPassword?: string } {
  return { ...payload, ...confirmation };
}
