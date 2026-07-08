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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="critical-action-title">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onCancel} aria-label="Schließen" />
      <div className={`relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-xl ${destructive ? "admin-modal-danger" : "admin-modal-warning"}`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className={`mt-0.5 h-6 w-6 shrink-0 ${destructive ? "text-red-600" : "text-amber-600"}`} aria-hidden />
          <div>
            <h2 id="critical-action-title" className="font-heading text-lg font-bold text-text-primary">
              {title}
            </h2>
            <p className="mt-2 text-sm text-text-muted">{description}</p>
            <p className="mt-2 text-xs text-text-muted">Diese Aktion wird im Aktivitätsprotokoll gespeichert.</p>
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
