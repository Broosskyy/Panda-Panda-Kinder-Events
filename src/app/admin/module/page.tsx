import { adminDynamicView } from "@/lib/admin/dynamic-view";

const ModulesView = adminDynamicView(
  () => import("@/components/admin/views/ModulesView"),
  "ModulesView",
);

export default function AdminModulesPage() {
  return <ModulesView />;
}
