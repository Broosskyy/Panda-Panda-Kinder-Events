import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/site-url";

export function getSeoDefaultImage(): string {
  return `${getSiteUrl()}${BRAND.ogImage}`;
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const base = getSiteUrl();
  const url = opts.path ? `${base}${opts.path}` : base;
  const image = opts.image ?? getSeoDefaultImage();

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "de_DE",
      url,
      siteName: siteConfig.name,
      title: opts.title,
      description: opts.description,
      images: [{ url: image, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function organizationJsonLd(opts: { email: string; phone: string; location: string }) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: base,
    email: opts.email,
    telephone: opts.phone,
    areaServed: opts.location,
    logo: `${base}${siteConfig.assets.logo}`,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function serviceJsonLd(services: { title: string; description: string }[]) {
  const base = getSiteUrl();
  return services.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: base,
    },
    areaServed: "DE",
  }));
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  publishedAt?: string | null;
  image?: string | null;
}) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url: `${base}${opts.path}`,
    datePublished: opts.publishedAt ?? undefined,
    image: opts.image ?? getSeoDefaultImage(),
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${base}${siteConfig.assets.logo}`,
      },
    },
  };
}

/** @deprecated use getSeoDefaultImage() */
export const SEO_DEFAULT_IMAGE = getSeoDefaultImage();
