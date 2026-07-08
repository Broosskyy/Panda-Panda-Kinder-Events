import { adminDynamicView } from "@/lib/admin/dynamic-view";

const BookingsView = adminDynamicView(
  () => import("@/components/admin/views/BookingsView"),
  "BookingsView",
);

export default function AdminBookingsPage() {
  return <BookingsView />;
}
