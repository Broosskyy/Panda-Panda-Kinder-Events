type AdminStatusBadgeVariant = "default" | "success" | "warning" | "danger" | "muted" | "info";

const variantClass: Record<AdminStatusBadgeVariant, string> = {
  default: "admin-status-badge-default",
  success: "admin-status-badge-success",
  warning: "admin-status-badge-warning",
  danger: "admin-status-badge-danger",
  muted: "admin-status-badge-muted",
  info: "admin-status-badge-info",
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
  archived?: boolean,
): AdminStatusBadgeVariant {
  if (archived) return "muted";
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

export function bookingStatusVariant(status: string): AdminStatusBadgeVariant {
  switch (status) {
    case "new":
      return "info";
    case "contacted":
      return "warning";
    case "confirmed":
    case "completed":
      return "success";
    case "declined":
    case "cancelled":
      return "danger";
    default:
      return "muted";
  }
}

export function reviewStatusVariant(approved: boolean): AdminStatusBadgeVariant {
  return approved ? "success" : "warning";
}

export interface ReviewDisplayStatus {
  label: string;
  variant: AdminStatusBadgeVariant;
}

export function getReviewDisplayStatus(review: {
  approved: boolean;
  verified: boolean;
  admin_reply: string | null;
}): ReviewDisplayStatus {
  if (!review.approved) {
    return { label: "Wartet auf Prüfung", variant: "warning" };
  }
  if (review.admin_reply?.trim()) {
    return { label: "Beantwortet", variant: "info" };
  }
  if (review.verified) {
    return { label: "Verifiziert", variant: "success" };
  }
  return { label: "Veröffentlicht", variant: "success" };
}

export function postStatusVariant(published: boolean): AdminStatusBadgeVariant {
  return published ? "success" : "muted";
}
