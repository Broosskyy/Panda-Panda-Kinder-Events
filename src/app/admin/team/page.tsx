import { adminDynamicView } from "@/lib/admin/dynamic-view";

const TeamView = adminDynamicView(
  () => import("@/components/admin/views/TeamView"),
  "TeamView",
);

export default function AdminTeamPage() {
  return <TeamView />;
}
