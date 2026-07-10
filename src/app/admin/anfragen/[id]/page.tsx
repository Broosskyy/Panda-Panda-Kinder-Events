import { adminDynamicView } from "@/lib/admin/dynamic-view";

const BookingDetailView = adminDynamicView(
  () => import("@/components/admin/views/BookingDetailView"),
  "BookingDetailView",
);

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} />;
}
