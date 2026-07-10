import { adminDynamicView } from "@/lib/admin/dynamic-view";

const TeamMemberEditView = adminDynamicView(
  () => import("@/components/admin/views/TeamMemberEditView"),
  "TeamMemberEditView",
);

export default function AdminTeamNewPage() {
  return <TeamMemberEditView />;
}
