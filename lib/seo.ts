import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const SEO_DEFAULT_IMAGE = `${siteConfig.url}/panda-illustration.svg`;

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
  image?: string;
}): Metadata {
  const url = opts.path ? `${siteConfig.url}${opts.path}` : siteConfig.url;
  const image = opts.image ?? SEO_DEFAULT_IMAGE;

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
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    email: opts.email,
    telephone: opts.phone,
    areaServed: opts.location,
    logo: `${siteConfig.url}${siteConfig.assets.logo}`,
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
  return services.map((service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: "DE",
  }));
}
