import { adminDynamicView } from "@/lib/admin/dynamic-view";

const InvoiceDetailView = adminDynamicView(
  () => import("@/components/admin/views/InvoiceDetailView"),
  "InvoiceDetailView",
);

export default async function AdminInvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvoiceDetailView invoiceId={id} />;
}
