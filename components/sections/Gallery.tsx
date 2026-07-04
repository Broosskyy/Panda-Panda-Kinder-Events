"use client";

import { useState } from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { galleryImages as defaultGallery } from "@/lib/gallery";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import type { SiteContactSettings } from "@/lib/cms/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Lightbox } from "@/components/ui/Lightbox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface GalleryProps {
  images?: { src: string; alt: string }[];
  contact?: SiteContactSettings;
}

export function Gallery({
  images = defaultGallery,
  contact = DEFAULT_SITE_SETTINGS.contact,
}: GalleryProps) {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <section id="galerie" className="scroll-mt-24 section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Einblicke in unsere Arbeit"
            subtitle="Echte Momente, echte Freude — so sieht Panda-Bande aus."
          />
        </ScrollReveal>

        <div className="swipe-bleed md:mx-0 md:px-0">
          <ul
            className="swipe-track md:grid md:grid-cols-2 md:gap-5 md:overflow-visible lg:grid-cols-3 lg:gap-6"
            role="list"
            aria-label="Galerie"
          >
            {images.map((image, index) => (
              <li
                key={`${image.src}-${index}`}
                className={`swipe-item w-[min(78vw,18rem)] sm:w-[min(80vw,20rem)] md:w-auto ${
                  index % 3 === 0 ? "md:row-span-1" : ""
                }`}
              >
                <ScrollReveal delay={index * 80}>
                  <button
                    type="button"
                    className={`gallery-tile group relative w-full ${
                      index % 3 === 0 ? "aspect-[3/4] md:aspect-[3/4]" : "aspect-[4/5] md:aspect-[4/3]"
                    }`}
                    onClick={() => setLightboxImage(image)}
                    aria-label={`${image.alt} vergrößern`}
                  >
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05] group-active:scale-105"
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
          <div className="mt-12 text-center sm:mt-16">
            <Button
              href={contact.instagram}
              size="lg"
              className="w-full shadow-lg sm:w-auto"
              icon={<Instagram className="h-5 w-5" aria-hidden />}
            >
              Mehr Eindrücke auf Instagram
            </Button>
          </div>
        </ScrollReveal>
      </Container>

      {lightboxImage && (
        <Lightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} />
      )}
    </section>
  );
}
