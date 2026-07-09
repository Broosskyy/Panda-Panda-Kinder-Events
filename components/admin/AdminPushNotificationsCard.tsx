"use client";

import { AdminCard } from "@/components/admin/AdminSidebar";
import { AdminPushNotificationsPanel } from "@/components/admin/AdminPushNotificationsPanel";

export function AdminPushNotificationsCard() {
  return (
    <AdminCard title="Push-Benachrichtigungen" compact>
      <AdminPushNotificationsPanel compact />
    </AdminCard>
  );
}
