import { AdminCard } from "@/components/admin/ui/AdminLayout";
import { ADMIN_MSG } from "@/lib/admin/messages";

interface AdminLoadingCardProps {
  message?: string;
  skeleton?: boolean;
  rows?: number;
}

export function AdminLoadingCard({
  message = ADMIN_MSG.loading,
  skeleton = true,
  rows = 3,
}: AdminLoadingCardProps) {
  if (skeleton) {
    return (
      <AdminCard compact>
        <div className="admin-skeleton-stack" role="status" aria-busy="true" aria-label={message}>
          {Array.from({ length: rows }, (_, i) => (
            <div
              key={i}
              className={`skeleton-block ${i === rows - 1 ? "h-16 w-full" : i === 0 ? "h-4 w-2/3" : "h-4 w-1/2"}`}
            />
          ))}
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard compact>
      <p className="text-sm text-text-muted" role="status" aria-live="polite">
        {message}
      </p>
    </AdminCard>
  );
}
