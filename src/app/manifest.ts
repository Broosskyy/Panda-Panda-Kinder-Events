import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Panda-Bande",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f1ea",
    theme_color: "#52563e",
    lang: "de",
    icons: [
      {
        src: "/panda-illustration.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
