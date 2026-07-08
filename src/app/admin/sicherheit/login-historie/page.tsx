import { adminDynamicView } from "@/lib/admin/dynamic-view";

const LoginHistoryView = adminDynamicView(
  () => import("@/components/admin/views/LoginHistoryView"),
  "LoginHistoryView",
);

export default function AdminLoginHistoryPage() {
  return <LoginHistoryView />;
}
