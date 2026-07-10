import { adminDynamicView } from "@/lib/admin/dynamic-view";

const CustomerEditView = adminDynamicView(
  () => import("@/components/admin/views/CustomerEditView"),
  "CustomerEditView",
);

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerEditView customerId={id} />;
}
