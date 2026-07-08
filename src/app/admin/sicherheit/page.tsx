import { adminDynamicView } from "@/lib/admin/dynamic-view";

const SecurityCenterView = adminDynamicView(
  () => import("@/components/admin/views/SecurityCenterView"),
  "SecurityCenterView",
);

export default function AdminSecurityPage() {
  return <SecurityCenterView />;
}
