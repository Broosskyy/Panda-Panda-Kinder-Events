import { NextResponse } from "next/server";
import { BRAND, withIconVersion } from "@/lib/brand";

export async function GET() {
  const manifest = {
    name: "Panda-Bande Admin",
    short_name: "PB Admin",
    description: "Sichere Verwaltung für Panda-Bande Kinderevents",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: BRAND.backgroundColor,
    theme_color: BRAND.themeColor,
    lang: "de",
    categories: ["business", "productivity"],
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
