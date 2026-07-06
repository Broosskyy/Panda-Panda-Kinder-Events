import type { Metadata, Viewport } from "next";
import { Playfair_Display, Montserrat, Caveat } from "next/font/google";
import { fetchSiteSettings } from "@/lib/cms/data";
import { resolveSeoMeta } from "@/lib/cms/resolve-settings";
import { BRAND, withIconVersion } from "@/lib/brand";
import { resolveFaviconUrl, resolveAppleTouchIconUrl } from "@/lib/brand/resolve";
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
  let branding = null;

  try {
    const settings = await fetchSiteSettings();
    seo = resolveSeoMeta(settings);
    branding = settings.branding;
  } catch {
    seo = {
      baseUrl: getSiteUrl(),
      title: `${siteConfig.name} — Liebevolle Kinderbetreuung für euer Event`,
      description: siteConfig.description,
      ogImage: `${getSiteUrl()}${BRAND.assets.ogImage}`,
      robotsIndex: true,
      googleSiteVerification: undefined,
      googleAnalyticsId: undefined,
      microsoftClarityId: undefined,
    };
  }

  const favicon = resolveFaviconUrl(branding ?? undefined);
  const appleIcon = resolveAppleTouchIconUrl(branding ?? undefined);
  const faviconV = withIconVersion(favicon);
  const appleV = withIconVersion(appleIcon);
  const icoV = withIconVersion(BRAND.assets.faviconIco);

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
        { url: faviconV, type: "image/png", sizes: "512x512" },
        { url: icoV, sizes: "any" },
        { url: withIconVersion(BRAND.assets.favicon32), type: "image/png", sizes: "32x32" },
        { url: withIconVersion(BRAND.assets.favicon16), type: "image/png", sizes: "16x16" },
      ],
      apple: [{ url: appleV, type: "image/png", sizes: "180x180" }],
      shortcut: [{ url: faviconV }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: BRAND.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${playfair.variable} ${montserrat.variable} ${caveat.variable}`}>
      <head>
        <link rel="preload" href={BRAND.master} as="image" type="image/png" />
        <link rel="icon" href={withIconVersion(BRAND.assets.faviconPng)} type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href={withIconVersion(BRAND.assets.faviconIco)} />
        <link rel="apple-touch-icon" href={withIconVersion(BRAND.assets.appleTouchIcon)} sizes="180x180" />
        <meta name="msapplication-config" content="/branding/browserconfig.xml" />
      </head>
      <body className="antialiased">
        <AnalyticsScripts />
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
