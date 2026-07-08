import { adminDynamicView } from "@/lib/admin/dynamic-view";

const AuditView = adminDynamicView(
  () => import("@/components/admin/views/AuditView"),
  "AuditView",
);

export default function AdminUserAuditPage() {
  return <AuditView embedded />;
}
