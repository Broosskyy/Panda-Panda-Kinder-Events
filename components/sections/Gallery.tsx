"use client";

import { useState } from "react";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { galleryImages } from "@/lib/gallery";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Lightbox } from "@/components/ui/Lightbox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Gallery() {
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <section id="galerie" className="scroll-mt-24 section-padding">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Einblicke in unsere Arbeit"
            subtitle="Echte Momente, echte Freude — so sieht Panda-Bande aus."
          />
        </ScrollReveal>

        <div
          className="swipe-track -mx-5 gap-5 px-5 md:hidden"
          role="region"
          aria-label="Galerie — horizontal scrollen"
        >
          {galleryImages.map((image) => (
            <button
              key={image.src}
              type="button"
              className="swipe-item group relative aspect-[4/5] w-[min(80vw,20rem)] overflow-hidden rounded-[var(--radius-card)] shadow-lg"
              onClick={() => setLightboxImage(image)}
              aria-label={`${image.alt} vergrößern`}
            >
              <Image
                src={image.src}
                alt=""
                fill
                className="object-cover transition-transform duration-700 ease-out group-active:scale-105"
                sizes="80vw"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        <div className="masonry-grid hidden gap-6 md:block">
          {galleryImages.map((image, i) => (
            <ScrollReveal key={image.src} delay={i * 80}>
              <button
                type="button"
                className={`masonry-item group relative w-full overflow-hidden rounded-[var(--radius-card)] shadow-lg ${
                  i % 3 === 0 ? "aspect-[3/4]" : "aspect-[4/3]"
                }`}
                onClick={() => setLightboxImage(image)}
                aria-label={`${image.alt} vergrößern`}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  sizes="(max-width: 1024px) 33vw, 20vw"
                  loading="lazy"
                />
              </button>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="mt-16 text-center">
            <Button
              href={siteConfig.contact.instagram}
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
        <Lightbox
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </section>
  );
}
