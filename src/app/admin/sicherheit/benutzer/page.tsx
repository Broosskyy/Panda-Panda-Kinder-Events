import { adminDynamicView } from "@/lib/admin/dynamic-view";

const UsersView = adminDynamicView(
  () => import("@/components/admin/views/UsersView"),
  "UsersView",
);

export default function AdminUsersPage() {
  return <UsersView />;
}
