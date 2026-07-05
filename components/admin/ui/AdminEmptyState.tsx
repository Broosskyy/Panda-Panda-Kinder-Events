import type { LucideIcon } from "lucide-react";
import { AdminButton } from "./AdminButton";

interface AdminEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: AdminEmptyStateProps) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon" aria-hidden>
        <Icon className="h-8 w-8 text-primary/60" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">{description}</p>
      {actionLabel && (onAction || actionHref) ? (
        <div className="mt-5">
          <AdminButton variant="primary" onClick={onAction} href={actionHref}>
            {actionLabel}
          </AdminButton>
        </div>
      ) : null}
    </div>
  );
}
