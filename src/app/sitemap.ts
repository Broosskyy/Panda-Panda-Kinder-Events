import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { fetchPublishedPosts } from "@/lib/cms/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchPublishedPosts(100);
  const now = new Date();

  return [
    { url: siteConfig.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/aktuelles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/aktuelles/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(post.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${siteConfig.url}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/agb`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
