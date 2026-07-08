import { adminDynamicView } from "@/lib/admin/dynamic-view";

const SessionsView = adminDynamicView(
  () => import("@/components/admin/views/SessionsView"),
  "SessionsView",
);

export default function AdminSessionsPage() {
  return <SessionsView />;
}
