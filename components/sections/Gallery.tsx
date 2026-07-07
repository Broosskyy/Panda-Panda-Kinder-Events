"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { resolveSectionHeading } from "@/lib/cms/normalize-settings";
import type { SiteContactSettings, SiteSectionHeading } from "@/lib/cms/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PORTRAIT_BLUR_DATA_URL } from "@/lib/image-placeholder";
import { Lightbox, type LightboxItem } from "@/components/ui/Lightbox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const GALLERY_FALLBACK =
  "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=1000&fit=crop&q=85";

interface GalleryImageItem {
  src: string;
  alt: string;
  category?: string;
  title?: string;
}

interface GalleryProps {
  images?: GalleryImageItem[];
  contact?: SiteContactSettings;
  heading?: SiteSectionHeading;
}

export function Gallery({
  images,
  contact = DEFAULT_SITE_SETTINGS.contact,
  heading,
}: GalleryProps) {
  const safeHeading = resolveSectionHeading(heading, "gallery");
  const [filter, setFilter] = useState<string>("Alle");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const fromImages = new Set((images ?? []).map((img) => img.category).filter(Boolean));
    const dynamic = GALLERY_CATEGORIES.filter((c) => c === "Alle" || fromImages.has(c));
    return dynamic.length > 1 ? dynamic : GALLERY_CATEGORIES;
  }, [images]);

  const filtered = useMemo(() => {
    if (!images?.length) return [];
    if (filter === "Alle") return images;
    return images.filter((img) => img.category === filter);
  }, [images, filter]);

  if (!images?.length) return null;

  return (
    <section id="galerie" className="section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading title={safeHeading.title} subtitle={safeHeading.subtitle} />
        </ScrollReveal>

        <div className="gallery-filter-row mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Galerie Filter">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={filter === category}
              className={`gallery-filter-chip ${filter === category ? "gallery-filter-chip-active" : ""}`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="swipe-bleed swipe-bleed-reset-md">
          <ul
            className="swipe-track md:grid md:grid-cols-2 md:gap-5 md:overflow-visible lg:grid-cols-3 lg:gap-6"
            role="list"
            aria-label="Galerie"
          >
            {filtered.map((image, index) => (
              <li key={`${image.src}-${index}`} className="swipe-item swipe-item-card md:w-auto">
                <ScrollReveal delay={index * 80}>
                  <button
                    type="button"
                    className="gallery-tile group relative aspect-[4/5] w-full md:aspect-[4/3]"
                    onClick={() => setLightboxIndex(index)}
                    aria-label={`${image.alt} vergrößern`}
                  >
                    <Image
                      src={image.src?.trim() || GALLERY_FALLBACK}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      sizes="(max-width: 1024px) 33vw, 20vw"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={PORTRAIT_BLUR_DATA_URL}
                      unoptimized={image.src.includes("supabase.co")}
                    />
                    {image.category && image.category !== "Alle" ? (
                      <span className="gallery-tile-label">{image.category}</span>
                    ) : null}
                  </button>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>

        <div className="section-content-gap text-center">
            <Button
              href={contact.instagram}
              size="lg"
              className="btn-equal w-full shadow-lg sm:w-auto"
              icon={<Instagram className="h-5 w-5" aria-hidden />}
            >
              Mehr Eindrücke auf Instagram
            </Button>
          </div>
      </Container>

      {lightboxIndex != null ? (
        <Lightbox
          items={filtered.map(
            (img): LightboxItem => ({
              src: img.src?.trim() || GALLERY_FALLBACK,
              alt: img.alt,
              title: img.title,
              category: img.category,
            }),
          )}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex}
        />
      ) : null}
    </section>
  );
}
