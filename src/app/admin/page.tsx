import { adminDynamicView } from "@/lib/admin/dynamic-view";

const DashboardView = adminDynamicView(
  () => import("@/components/admin/views/DashboardView"),
  "DashboardView",
);

export default function AdminDashboardPage() {
  return <DashboardView />;
}
