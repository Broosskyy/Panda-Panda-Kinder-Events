import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
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

export default async function HomePage() {
  const [settings, services, faqs, galleryImages, posts] = await Promise.all([
    fetchSiteSettings(),
    fetchCmsServices(),
    fetchCmsFaqs(),
    fetchGalleryImages(),
    fetchPublishedPosts(6),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    email: settings.contact.email,
    telephone: settings.contact.phone,
    areaServed: "DE",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <SkipLink />
      <Header />
      <main id="main-content">
        <Hero hero={settings.hero} about={settings.about} />
        <Usps />
        <Services items={services} />
        <Process />
        <Gallery images={galleryImages} contact={settings.contact} />
        <Testimonials />
        <About about={settings.about} />
        <News posts={posts} />
        <Faq items={faqs} />
        <Contact contact={settings.contact} />
      </main>
      <Footer contact={settings.contact} footer={settings.footer} />
      <WhatsAppFab contact={settings.contact} />
    </>
  );
}
