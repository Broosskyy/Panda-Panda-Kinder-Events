import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/AdminGate";

export const metadata: Metadata = {
  title: "Panda-Bande Admin",
  robots: { index: false, follow: false },
  manifest: "/admin/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Panda-Bande Admin",
    statusBarStyle: "default",
  },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <AdminGate>{children}</AdminGate>;
}
