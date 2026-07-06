import type { MetadataRoute } from "next";
import { fetchSiteSettings } from "@/lib/cms/data";
import { resolvePublicSiteUrl } from "@/lib/cms/resolve-settings";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await fetchSiteSettings();
  const base = resolvePublicSiteUrl(settings);
  const index = settings.seo.robotsIndex !== false;

  return {
    rules: {
      userAgent: "*",
      allow: index ? "/" : [],
      disallow: ["/admin/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
