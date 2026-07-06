import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { SkipLink } from "@/components/ui/SkipLink";
import { Hero } from "@/components/sections/Hero";
import { Usps } from "@/components/sections/Usps";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { Gallery } from "@/components/sections/Gallery";
import { Testimonials } from "@/components/sections/Testimonials";
import { About } from "@/components/sections/About";
import { Faq } from "@/components/sections/Faq";
import { Contact } from "@/components/sections/Contact";
import { News } from "@/components/sections/News";
import { siteConfig } from "@/config/site";
import {
  fetchCmsFaqs,
  fetchCmsServices,
  fetchGalleryImages,
  fetchPublishedPosts,
  fetchSiteSettings,
} from "@/lib/cms/data";
import { fetchApprovedReviews } from "@/lib/cms/reviews";
import { breadcrumbJsonLd, getSeoDefaultImage, organizationJsonLd, serviceJsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${siteConfig.name} — Kinderbetreuung für Events`,
  description: siteConfig.description,
  alternates: { canonical: getSiteUrl() },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: getSiteUrl(),
    images: [{ url: getSeoDefaultImage(), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [getSeoDefaultImage()],
  },
};

export default async function HomePage() {
  const [settings, services, faqs, galleryImages, posts, reviews] = await Promise.all([
    fetchSiteSettings(),
    fetchCmsServices(),
    fetchCmsFaqs(),
    fetchGalleryImages(),
    fetchPublishedPosts(6),
    fetchApprovedReviews(),
  ]);

  const rating =
    reviews.length > 0
      ? {
          average: reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
          count: reviews.length,
        }
      : null;

  const baseUrl = getSiteUrl();

  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    description: siteConfig.description,
    url: baseUrl,
    email: settings.contact.email,
    telephone: settings.contact.phone,
    address: {
      "@type": "PostalAddress",
      addressLocality: settings.contact.location,
      addressCountry: "DE",
    },
    areaServed: "DE",
    image: getSeoDefaultImage(),
  };

  if (reviews.length > 0) {
    localBusiness.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: rating!.average.toFixed(1),
      reviewCount: reviews.length,
    };
  }

  const jsonLd = [
    localBusiness,
    organizationJsonLd({
      email: settings.contact.email,
      phone: settings.contact.phone,
      location: settings.contact.location,
    }),
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    breadcrumbJsonLd([{ name: "Startseite", url: baseUrl }]),
    ...serviceJsonLd(services.map((s) => ({ title: s.title, description: s.description }))),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SkipLink />
      <Header navigation={settings.navigation} branding={settings.branding} />
      <main id="main-content" className="public-main">
        <Hero hero={settings.hero} trustBadges={settings.trustBadges} rating={rating} />
        <Usps usps={settings.usps} />
        <Services items={services} heading={settings.sections.services} />
        <Process process={settings.process} heading={settings.sections.process} />
        <Gallery images={galleryImages} contact={settings.contact} heading={settings.sections.gallery} />
        <Testimonials reviews={reviews} heading={settings.sections.testimonials} />
        <About about={settings.about} team={settings.publicTeam} heading={settings.sections.about} />
        <News posts={posts} heading={settings.sections.news} />
        <Faq items={faqs} heading={settings.sections.faq} />
        <Contact contact={settings.contact} heading={settings.sections.contact} privacyHint={settings.legal.inquiryPrivacyHint} />
      </main>
      <Footer contact={settings.contact} footer={settings.footer} branding={settings.branding} />
      <PublicChrome
        contact={settings.contact}
        ctaLabel={settings.navigation.ctaLabel}
        cookieNoticeText={settings.legal.cookieNoticeText}
      />
    </>
  );
}
