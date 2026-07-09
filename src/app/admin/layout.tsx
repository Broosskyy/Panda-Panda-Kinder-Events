import type { Metadata } from "next";
import Script from "next/script";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminPwaEarlyCapture } from "@/components/admin/AdminPwaEarlyCapture";
import { ADMIN_MANIFEST_PATH } from "@/lib/admin/routes";

const ADMIN_MANIFEST = ADMIN_MANIFEST_PATH;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: "Panda-Bande Admin" },
    robots: { index: false, follow: false },
    manifest: ADMIN_MANIFEST,
    applicationName: "Panda-Bande Admin",
    appleWebApp: {
      capable: true,
      title: "Panda-Bande Admin",
      statusBarStyle: "default",
    },
    other: {
      "mobile-web-app-capable": "yes",
    },
  };
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script src="/admin/pwa-capture.js" strategy="beforeInteractive" />
      <AdminPwaEarlyCapture />
      <AdminGate>{children}</AdminGate>
    </>
  );
}
