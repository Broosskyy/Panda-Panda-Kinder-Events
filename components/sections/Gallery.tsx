"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { GALLERY_CATEGORIES } from "@/lib/gallery";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteContactSettings, SiteSectionHeading } from "@/lib/cms/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Lightbox } from "@/components/ui/Lightbox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionCta } from "@/components/ui/SectionCta";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface GalleryImageItem {
  src: string;
  alt: string;
  category?: string;
}

interface GalleryProps {
  images?: GalleryImageItem[];
  contact?: SiteContactSettings;
  heading?: SiteSectionHeading;
}

export function Gallery({
  images,
  contact = DEFAULT_SITE_SETTINGS.contact,
  heading = DEFAULT_SITE_SETTINGS.sections.gallery,
}: GalleryProps) {
  const [filter, setFilter] = useState<string>("Alle");
  const [lightboxImage, setLightboxImage] = useState<GalleryImageItem | null>(null);

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
          <SectionHeading title={heading.title} subtitle={heading.subtitle} />
        </ScrollReveal>

        <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Galerie Filter">
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

        <div className="swipe-bleed md:mx-0 md:px-0">
          <ul
            className="swipe-track md:grid md:grid-cols-2 md:gap-5 md:overflow-visible lg:grid-cols-3 lg:gap-6"
            role="list"
            aria-label="Galerie"
          >
            {filtered.map((image, index) => (
              <li key={`${image.src}-${index}`} className="swipe-item w-[min(78vw,18rem)] sm:w-[min(80vw,20rem)] md:w-auto">
                <ScrollReveal delay={index * 80}>
                  <button
                    type="button"
                    className="gallery-tile group relative aspect-[4/5] w-full md:aspect-[4/3]"
                    onClick={() => setLightboxImage(image)}
                    aria-label={`${image.alt} vergrößern`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      sizes="(max-width: 1024px) 33vw, 20vw"
                      loading="lazy"
                      unoptimized={image.src.includes("supabase.co")}
                    />
                  </button>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>

        <ScrollReveal>
          <div className="mt-10 text-center sm:mt-12">
            <Button
              href={contact.instagram}
              size="lg"
              className="btn-equal w-full shadow-lg sm:w-auto"
              icon={<Instagram className="h-5 w-5" aria-hidden />}
            >
              Mehr Eindrücke auf Instagram
            </Button>
          </div>
          <SectionCta className="mt-10" />
        </ScrollReveal>
      </Container>

      {lightboxImage ? (
        <Lightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />
      ) : null}
    </section>
  );
}
