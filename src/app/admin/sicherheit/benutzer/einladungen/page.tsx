import { adminDynamicView } from "@/lib/admin/dynamic-view";

const InvitesView = adminDynamicView(
  () => import("@/components/admin/views/InvitesView"),
  "InvitesView",
);

export default function AdminInvitesPage() {
  return <InvitesView />;
}
