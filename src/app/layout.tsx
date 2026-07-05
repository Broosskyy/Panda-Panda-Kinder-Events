import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat, Caveat } from "next/font/google";
import { siteConfig } from "@/config/site";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { SEO_DEFAULT_IMAGE } from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Liebevolle Kinderbetreuung für euer Event`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Kinderbetreuung",
    "Kinderevents",
    "Hochzeit Kinderbetreuung",
    "Kindergeburtstag",
    "Panda-Bande",
    "NRW",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: SEO_DEFAULT_IMAGE, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [SEO_DEFAULT_IMAGE],
  },
  alternates: { canonical: siteConfig.url },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/panda-illustration.svg", type: "image/svg+xml" }],
    apple: [{ url: "/panda-illustration.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#52563e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${playfair.variable} ${montserrat.variable} ${caveat.variable}`}>
      <body className="antialiased">
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
