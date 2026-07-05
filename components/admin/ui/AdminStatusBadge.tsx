type AdminStatusBadgeVariant = "default" | "success" | "warning" | "danger" | "muted";

const variantClass: Record<AdminStatusBadgeVariant, string> = {
  default: "admin-status-badge-default",
  success: "admin-status-badge-success",
  warning: "admin-status-badge-warning",
  danger: "admin-status-badge-danger",
  muted: "admin-status-badge-muted",
};

interface AdminStatusBadgeProps {
  label: string;
  variant?: AdminStatusBadgeVariant;
}

export function AdminStatusBadge({ label, variant = "default" }: AdminStatusBadgeProps) {
  return <span className={`admin-status-badge ${variantClass[variant]}`}>{label}</span>;
}

export function crmDocumentStatusVariant(
  status: string,
): AdminStatusBadgeVariant {
  switch (status) {
    case "paid":
    case "confirmed":
      return "success";
    case "sent":
    case "open":
      return "warning";
    case "cancelled":
      return "danger";
    case "draft":
    default:
      return "muted";
  }
}

export function reviewStatusVariant(approved: boolean): AdminStatusBadgeVariant {
  return approved ? "success" : "warning";
}

export function postStatusVariant(published: boolean): AdminStatusBadgeVariant {
  return published ? "success" : "muted";
}
