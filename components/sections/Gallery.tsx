import Image from "next/image";
import { Instagram } from "lucide-react";
import { galleryImages } from "@/lib/gallery";
import { siteConfig } from "@/lib/site-config";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Gallery() {
  return (
    <section id="galerie" className="scroll-mt-24 py-16 md:py-20">
      <Container>
        <SectionHeading
          title="Einblicke in unsere Arbeit"
          subtitle="Echte Momente, echte Freude — so sieht Panda-Bande aus."
        />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {galleryImages.map((image) => (
            <div
              key={image.src}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button
            href={siteConfig.contact.instagram}
            icon={<Instagram className="h-4 w-4" />}
          >
            Mehr Eindrücke auf Instagram
          </Button>
        </div>
      </Container>
    </section>
  );
}
