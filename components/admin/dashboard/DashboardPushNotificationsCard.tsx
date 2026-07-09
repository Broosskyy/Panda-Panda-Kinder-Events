"use client";

import { AdminCard } from "@/components/admin/AdminSidebar";
import { AdminPushNotificationsPanel } from "@/components/admin/AdminPushNotificationsPanel";
import { useAdminSession } from "@/components/admin/AdminSessionProvider";

export function DashboardPushNotificationsCard() {
  const { permissions, status } = useAdminSession();
  if (status !== "ready" || !permissions.includes("inquiries:write")) return null;

  return (
    <AdminCard compact>
      <AdminPushNotificationsPanel compact />
    </AdminCard>
  );
}
