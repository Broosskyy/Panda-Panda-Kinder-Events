import { NextResponse } from "next/server";
import { BRAND, withIconVersion } from "@/lib/brand";
import { siteConfig } from "@/config/site";

/** Public site manifest — not installable (display: browser). Not auto-linked on /admin. */
export async function GET() {
  const manifest = {
    name: siteConfig.name,
    short_name: BRAND.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "browser",
    orientation: "portrait-primary",
    background_color: BRAND.backgroundColor,
    theme_color: BRAND.themeColor,
    lang: "de",
    categories: ["business", "lifestyle"],
    icons: [
      {
        src: withIconVersion(BRAND.assets.icon192),
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withIconVersion(BRAND.assets.icon512),
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: withIconVersion(BRAND.assets.iconMaskable512),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
