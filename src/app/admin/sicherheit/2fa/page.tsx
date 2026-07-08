import { adminDynamicView } from "@/lib/admin/dynamic-view";

const TwoFactorView = adminDynamicView(
  () => import("@/components/admin/views/TwoFactorView"),
  "TwoFactorView",
);

export default function AdminTwoFactorPage() {
  return <TwoFactorView />;
}
