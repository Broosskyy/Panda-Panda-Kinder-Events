import { adminDynamicView } from "@/lib/admin/dynamic-view";

const ErsteSchritteView = adminDynamicView(
  () => import("@/components/admin/views/ErsteSchritteView"),
  "ErsteSchritteView",
);

export default function AdminErsteSchrittePage() {
  return <ErsteSchritteView />;
}
