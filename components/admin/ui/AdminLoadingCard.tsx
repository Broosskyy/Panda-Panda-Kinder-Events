import { AdminCard } from "@/components/admin/AdminSidebar";
import { ADMIN_MSG } from "@/lib/admin/messages";

interface AdminLoadingCardProps {
  message?: string;
}

export function AdminLoadingCard({ message = ADMIN_MSG.loading }: AdminLoadingCardProps) {
  return (
    <AdminCard>
      <p className="text-sm text-text-muted" role="status" aria-live="polite">
        {message}
      </p>
    </AdminCard>
  );
}
