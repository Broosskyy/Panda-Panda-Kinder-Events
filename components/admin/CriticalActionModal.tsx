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
  onConfirm: (payload: { confirmPassword?: string; criticalAcknowledged?: boolean }) => Promise<void>;
  isLegacy?: boolean;
  loading?: boolean;
}

export function CriticalActionModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  isLegacy = false,
  loading = false,
}: CriticalActionModalProps) {
  const [password, setPassword] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    await onConfirm(
      isLegacy
        ? { criticalAcknowledged: acknowledged }
        : { confirmPassword: password },
    );
    setPassword("");
    setAcknowledged(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onCancel} aria-label="Schließen" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-amber-300 bg-bg-card p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" aria-hidden />
          <div>
            <h2 className="font-heading text-lg font-bold text-text-primary">{title}</h2>
            <p className="mt-2 text-sm text-text-muted">{description}</p>
          </div>
        </div>

        {isLegacy ? (
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>Ich verstehe, dass diese Aktion wichtig ist und möchte fortfahren.</span>
          </label>
        ) : (
          <AdminFormField
            label="Ihr Passwort zur Bestätigung"
            required
            hint="Nur Super Admins können diese Aktion ausführen."
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
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <AdminButton variant="secondary" onClick={onCancel} disabled={loading}>
            {ADMIN_BTN.cancel}
          </AdminButton>
          <AdminButton
            variant="primary"
            onClick={() => void handleConfirm()}
            disabled={loading || (isLegacy ? !acknowledged : !password.trim())}
          >
            Sicher bestätigen
          </AdminButton>
        </div>
      </div>
    </div>
  );
}

/** Merge critical confirmation fields into a JSON body for API calls. */
export function withCriticalConfirmation<T extends object>(
  payload: T,
  confirmation: { confirmPassword?: string; criticalAcknowledged?: boolean },
): T & { confirmPassword?: string; criticalAcknowledged?: boolean } {
  return { ...payload, ...confirmation };
}
