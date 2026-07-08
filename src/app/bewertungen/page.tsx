import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { BrandMark } from "@/components/ui/Logo";
import { StarRating } from "@/components/ui/StarRating";
import { Button } from "@/components/ui/Button";
import { ReviewsPageGrid } from "@/components/reviews/ReviewsPageGrid";
import { fetchApprovedReviews } from "@/lib/cms/reviews";
import { fetchSiteSettings } from "@/lib/cms/data";
import { buildPageMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site-url";
import { safeJsonLdStringify } from "@/lib/json-ld";
import { siteConfig } from "@/config/site";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const reviews = await fetchApprovedReviews();
  const count = reviews.length;
  const description =
    count > 0
      ? `${count} ${count === 1 ? "echte Bewertung" : "echte Bewertungen"} von Familien — Sternebewertungen, Erfahrungsberichte und Antworten der Panda-Bande.`
      : "Echte Bewertungen von Familien — Sternebewertungen und Erfahrungsberichte zur Panda-Bande Kinderevents.";

  return buildPageMetadata({
    title: `Bewertungen — ${siteConfig.name}`,
    description,
    path: "/bewertungen",
  });
}

export default async function BewertungenPage() {
  const [reviews, settings] = await Promise.all([fetchApprovedReviews(), fetchSiteSettings()]);

  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const displayAverage = count > 0 ? average.toFixed(1).replace(".", ",") : null;
  const displayStars = count > 0 ? Math.round(average * 2) / 2 : 0;

  const jsonLd = [
    breadcrumbJsonLd([
      { name: "Startseite", url: getSiteUrl() },
      { name: "Bewertungen", url: `${getSiteUrl()}/bewertungen` },
    ]),
    ...(count > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: siteConfig.name,
            url: getSiteUrl(),
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: average.toFixed(1),
              reviewCount: count,
            },
            review: reviews.slice(0, 10).map((review) => ({
              "@type": "Review",
              author: { "@type": "Person", name: review.name },
              datePublished: review.created_at,
              reviewBody: review.text,
              reviewRating: {
                "@type": "Rating",
                ratingValue: review.rating,
                bestRating: 5,
              },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }} />
      <Header navigation={settings.navigation} branding={settings.branding} />
      <main
        id="main-content"
        className="public-main public-main-subpage bg-bg-primary pt-[max(6.5rem,calc(5rem+env(safe-area-inset-top,0px)))]"
      >
        <Container className="max-w-6xl py-10 sm:py-14">
          <Link
            href="/#bewertungen"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Zurück zur Startseite
          </Link>

          <h1 className="font-heading mt-8 text-3xl font-bold text-text-primary sm:text-4xl md:text-5xl">
            Bewertungen
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {settings.sections.testimonials.subtitle ||
              "Echte Rückmeldungen — freigegeben nach Prüfung durch unser Team."}
          </p>

          {count > 0 ? (
            <div className="mt-10 flex flex-col items-center gap-3 text-center sm:mt-12">
              <StarRating rating={displayStars} size="xl" />
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-4xl font-bold text-text-primary sm:text-5xl">{displayAverage}</span>
                <span className="text-xl text-text-muted">/ 5</span>
              </div>
              <p className="text-base text-text-muted md:text-lg">
                {count} {count === 1 ? "Bewertung" : "Bewertungen"}
              </p>
            </div>
          ) : null}

          {count === 0 ? (
            <Card padding="lg" hover={false} className="review-card mx-auto mt-12 max-w-xl text-center">
              <BrandMark className="mx-auto mb-6 opacity-90" />
              <p className="font-heading text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
                Noch keine öffentlichen Bewertungen
              </p>
              <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-text-secondary sm:text-lg">
                Sobald Bewertungen freigegeben wurden, erscheinen sie hier.
              </p>
              <Button href="/#bewertung-form" className="mt-9 w-full sm:mt-10 sm:w-auto" size="lg">
                Zur Bewertung auf der Startseite
              </Button>
            </Card>
          ) : (
            <ReviewsPageGrid reviews={reviews} className="mt-10 sm:mt-12" />
          )}
        </Container>
      </main>
      <Footer contact={settings.contact} footer={settings.footer} branding={settings.branding} />
      <PublicChrome
        contact={settings.contact}
        ctaLabel={settings.navigation.ctaLabel}
        cookieNoticeText={settings.legal.cookieNoticeText}
        footer={settings.footer}
      />
    </>
  );
}
