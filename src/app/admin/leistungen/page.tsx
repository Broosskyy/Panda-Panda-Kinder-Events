import { adminDynamicView } from "@/lib/admin/dynamic-view";

const ServicesView = adminDynamicView(
  () => import("@/components/admin/views/ServicesView"),
  "ServicesView",
);

export default function AdminServicesPage() {
  return <ServicesView />;
}
