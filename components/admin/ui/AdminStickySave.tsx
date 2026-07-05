"use client";

import type { ReactNode } from "react";
import { Save } from "lucide-react";
import { AdminButton } from "./AdminButton";

interface AdminStickySaveProps {
  label?: string;
  onSave: () => void;
  disabled?: boolean;
  children?: ReactNode;
}

export function AdminStickySave({
  label = "Speichern",
  onSave,
  disabled = false,
  children,
}: AdminStickySaveProps) {
  return (
    <div className="admin-sticky-save">
      <div className="admin-sticky-save-inner">
        {children}
        <AdminButton
          variant="primary"
          onClick={onSave}
          disabled={disabled}
          icon={<Save className="h-4 w-4" aria-hidden />}
        >
          {label}
        </AdminButton>
      </div>
    </div>
  );
}
