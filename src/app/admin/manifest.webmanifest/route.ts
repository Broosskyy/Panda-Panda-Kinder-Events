import { NextResponse } from "next/server";
import { BRAND, withIconVersion } from "@/lib/brand";

/** Legacy SW scope alias — referenced by install probes and smoke tests. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for SW compat smoke tests
const ADMIN_SCOPE = "/admin/";

export async function GET() {
  const manifest = {
    id: "/admin",
    name: "Panda-Bande Admin",
    short_name: "Panda Admin",
    description: "Sichere Verwaltung für Panda-Bande Kinderevents",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    background_color: BRAND.backgroundColor,
    theme_color: BRAND.themeColor,
    lang: "de",
    prefer_related_applications: false,
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
        src: withIconVersion(BRAND.assets.iconMaskable192),
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
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
