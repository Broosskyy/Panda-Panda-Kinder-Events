import Image from "next/image";
import { Calendar, Heart, ShieldCheck } from "lucide-react";
import { ICON_STROKE } from "@/lib/design";
import type { SiteHeroSettings, SiteTrustBadgesSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { resolveContentIcon } from "@/lib/cms/icons";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { StarRating } from "@/components/ui/StarRating";
import { PORTRAIT_BLUR_DATA_URL } from "@/lib/image-placeholder";

interface HeroRatingSummary {
  average: number;
  count: number;
}

interface HeroProps {
  hero?: SiteHeroSettings;
  trustBadges?: SiteTrustBadgesSettings;
  rating?: HeroRatingSummary | null;
}

export function Hero({
  hero = DEFAULT_SITE_SETTINGS.hero,
  trustBadges = DEFAULT_SITE_SETTINGS.trustBadges,
  rating = null,
}: HeroProps) {
  const heroImage = hero.imageUrl?.trim() || DEFAULT_SITE_SETTINGS.hero.imageUrl;
  const badges = trustBadges.items?.length ? trustBadges.items : DEFAULT_SITE_SETTINGS.trustBadges.items;

  return (
    <section id="startseite" className="hero-section relative section-padding-lg overflow-hidden">
      <FlowerOrnament className="pointer-events-none absolute left-0 top-20 h-20 w-20 opacity-35 sm:-left-4 sm:top-24 sm:h-28 sm:w-28 sm:opacity-50 md:h-40 md:w-40" />
      <FlowerOrnament
        variant="right"
        className="pointer-events-none absolute -right-4 top-32 hidden h-24 w-24 opacity-35 md:block lg:h-36 lg:w-36 lg:opacity-45"
      />

      <Container>
        <div className="grid items-center gap-5 sm:gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20 xl:gap-28">
          <div className="hero-content relative z-10 order-1 max-w-xl lg:order-none lg:max-w-lg lg:py-6 xl:max-w-xl">
            {rating && rating.count > 0 ? (
              <div className="hero-rating-pill mb-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-border/60 bg-bg-card/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2">
                <StarRating rating={Math.round(rating.average * 2) / 2} size="sm" />
                <span className="text-sm font-semibold text-text-primary">
                  {rating.average.toFixed(1).replace(".", ",")} / 5
                </span>
                <span className="text-sm text-text-muted">
                  · {rating.count} {rating.count === 1 ? "Bewertung" : "Bewertungen"}
                </span>
              </div>
            ) : (
              <div className="hero-rating-pill mb-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-bg-card/80 px-3.5 py-1.5 shadow-sm backdrop-blur-sm sm:mb-6 sm:px-4 sm:py-2">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm font-medium text-text-secondary">Liebevoll betreut · persönlich · in NRW</span>
              </div>
            )}

            <h1 className="font-heading text-[2rem] font-bold leading-[1.1] tracking-tight text-text-primary sm:text-[2.65rem] md:text-5xl lg:text-[3.5rem] lg:leading-[1.05] xl:text-[3.65rem]">
              {hero.headline}
            </h1>

            <p className="font-accent mt-3 text-lg leading-snug text-primary sm:mt-6 sm:text-xl md:text-[1.35rem] md:leading-snug">
              {hero.tagline}
            </p>

            <p className="mt-3 max-w-md text-base leading-relaxed text-text-secondary sm:mt-6 sm:max-w-lg sm:text-lg sm:leading-8 md:text-xl md:leading-9">
              {hero.subtitle}
            </p>

            <div className="hero-cta-group mt-5 w-full sm:mt-10">
              <Button
                href="#kontakt"
                size="lg"
                className="hero-cta-btn w-full sm:w-auto"
                icon={<Calendar className="h-5 w-5 shrink-0" aria-hidden />}
              >
                {hero.ctaPrimary}
              </Button>
              <Button
                href="#leistungen"
                variant="secondary"
                size="lg"
                className="hero-cta-btn w-full sm:w-auto"
                icon={<Heart className="h-5 w-5 shrink-0" aria-hidden />}
              >
                {hero.ctaSecondary}
              </Button>
            </div>

            <p className="mt-3 text-sm text-text-muted sm:mt-5">
              Unverbindlich · persönliche Rückmeldung · individuell geplant
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5 border-t border-border/40 pt-5 sm:mt-10 sm:gap-4 sm:pt-10 md:grid-cols-4 lg:gap-6">
              {badges.map((badge) => {
                const Icon = resolveContentIcon(badge.iconKey);
                return (
                  <div key={badge.text} className="trust-chip trust-chip-static">
                    <div className="trust-chip-icon">
                      <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" strokeWidth={ICON_STROKE} aria-hidden />
                    </div>
                    <span className="hero-trust-badge text-xs font-medium leading-snug text-text-primary sm:text-sm lg:text-[0.9375rem]">
                      {badge.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative order-2 lg:order-none">
            <div className="hero-image-wrap relative mx-auto aspect-[5/6] w-full max-h-[min(48vh,20rem)] overflow-hidden sm:aspect-[4/5] sm:max-h-none lg:-mr-4 xl:-mr-8">
              <Image
                src={heroImage}
                alt="Panda-Bande Team bei der liebevollen Kinderbetreuung"
                fill
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL={PORTRAIT_BLUR_DATA_URL}
                sizes="(max-width: 1024px) 100vw, 55vw"
                unoptimized={heroImage.includes("supabase.co")}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
