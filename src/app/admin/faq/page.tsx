import { adminDynamicView } from "@/lib/admin/dynamic-view";

const FaqsView = adminDynamicView(
  () => import("@/components/admin/views/FaqsView"),
  "FaqsView",
);

export default function AdminFaqPage() {
  return <FaqsView />;
}
