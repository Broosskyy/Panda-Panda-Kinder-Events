import type { Metadata } from "next";
import Script from "next/script";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminPwaEarlyCapture } from "@/components/admin/AdminPwaEarlyCapture";

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
  return (
    <>
      <Script src="/admin/pwa-capture.js" strategy="beforeInteractive" />
      <AdminPwaEarlyCapture />
      <AdminGate>{children}</AdminGate>
    </>
  );
}
