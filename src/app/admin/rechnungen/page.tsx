import { adminDynamicView } from "@/lib/admin/dynamic-view";

const InvoicesView = adminDynamicView(
  () => import("@/components/admin/views/InvoicesView"),
  "InvoicesView",
);

export default function AdminInvoicesPage() {
  return <InvoicesView />;
}
