import { adminDynamicView } from "@/lib/admin/dynamic-view";

const ContentView = adminDynamicView(
  () => import("@/components/admin/views/ContentView"),
  "ContentView",
);

export default function AdminContentPage() {
  return <ContentView />;
}
