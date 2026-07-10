import { adminDynamicView } from "@/lib/admin/dynamic-view";

const TeamMemberEditView = adminDynamicView(
  () => import("@/components/admin/views/TeamMemberEditView"),
  "TeamMemberEditView",
);

export default async function AdminTeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeamMemberEditView memberId={id} />;
}
