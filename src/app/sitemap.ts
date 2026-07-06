import type { MetadataRoute } from "next";
import { fetchPublishedPosts, fetchSiteSettings } from "@/lib/cms/data";
import { resolvePublicSiteUrl } from "@/lib/cms/resolve-settings";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await fetchSiteSettings();
  if (!settings.seo.sitemapEnabled) return [];

  const posts = await fetchPublishedPosts(100);
  const now = new Date();
  const base = resolvePublicSiteUrl(settings);

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/aktuelles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${base}/aktuelles/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
