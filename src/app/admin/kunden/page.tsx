import { adminDynamicView } from "@/lib/admin/dynamic-view";

const CustomersView = adminDynamicView(
  () => import("@/components/admin/views/CustomersView"),
  "CustomersView",
);

export default function AdminCustomersPage() {
  return <CustomersView />;
}
