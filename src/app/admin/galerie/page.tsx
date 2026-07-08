import { adminDynamicView } from "@/lib/admin/dynamic-view";

const GalleryView = adminDynamicView(
  () => import("@/components/admin/views/GalleryView"),
  "GalleryView",
);

export default function AdminGalleryPage() {
  return <GalleryView />;
}
