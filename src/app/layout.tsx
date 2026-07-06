import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat, Caveat } from "next/font/google";
import { fetchSiteSettings } from "@/lib/cms/data";
import { resolveSeoMeta } from "@/lib/cms/resolve-settings";
import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/site-url";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
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

export async function generateMetadata(): Promise<Metadata> {
  let seo: ReturnType<typeof resolveSeoMeta>;

  try {
    const settings = await fetchSiteSettings();
    seo = resolveSeoMeta(settings);
  } catch {
    seo = {
      baseUrl: getSiteUrl(),
      title: `${siteConfig.name} — Liebevolle Kinderbetreuung für euer Event`,
      description: siteConfig.description,
      ogImage: `${getSiteUrl()}/panda-illustration.svg`,
      robotsIndex: true,
      googleSiteVerification: undefined,
      googleAnalyticsId: undefined,
      microsoftClarityId: undefined,
    };
  }

  return {
    metadataBase: new URL(seo.baseUrl),
    title: {
      default: seo.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: seo.description,
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
      url: seo.baseUrl,
      siteName: siteConfig.name,
      title: seo.title,
      description: seo.description,
      images: [{ url: seo.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [seo.ogImage],
    },
    alternates: { canonical: seo.baseUrl },
    robots: seo.robotsIndex ? { index: true, follow: true } : { index: false, follow: false },
    manifest: "/manifest.webmanifest",
    verification: seo.googleSiteVerification
      ? { google: seo.googleSiteVerification }
      : undefined,
    icons: {
      icon: [
        { url: "/favicon.png", type: "image/png", sizes: "32x32" },
        { url: "/panda-illustration.svg", type: "image/svg+xml" },
      ],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#52563e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${playfair.variable} ${montserrat.variable} ${caveat.variable}`}>
      <body className="antialiased">
        <AnalyticsScripts />
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
