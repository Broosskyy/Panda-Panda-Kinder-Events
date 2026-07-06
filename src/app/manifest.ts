import type { MetadataRoute } from "next";
import { BRAND, withIconVersion } from "@/lib/brand";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: BRAND.shortName,
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
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
}
