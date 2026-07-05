import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CmsPost, SiteSectionHeading } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionCta } from "@/components/ui/SectionCta";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface NewsProps {
  posts: CmsPost[];
  heading?: SiteSectionHeading;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function News({
  posts,
  heading = DEFAULT_SITE_SETTINGS.sections.news,
}: NewsProps) {
  if (!posts.length) return null;

  return (
    <section id="aktuelles" className="section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading title={heading.title} subtitle={heading.subtitle} />
        </ScrollReveal>

        <div className="swipe-bleed md:mx-0 md:px-0">
          <ul
            className="swipe-track md:grid md:grid-cols-2 md:gap-8 md:overflow-visible lg:grid-cols-3"
            role="list"
            aria-label="Aktuelles"
          >
            {posts.map((post, i) => (
              <li key={post.id} className="swipe-item w-[min(88vw,22rem)] md:w-auto">
                <ScrollReveal delay={i * 80}>
                  <Link href={`/aktuelles/${post.slug}`} className="group block h-full">
                    <Card className="h-full overflow-hidden !p-0" padding="sm" hover>
                      {post.hero_image_url ? (
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          <Image
                            src={post.hero_image_url}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 1024px) 50vw, 33vw"
                            unoptimized={post.hero_image_url.includes("supabase.co")}
                          />
                        </div>
                      ) : null}
                      <div className="p-5 md:p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
                        <h3 className="mt-2 font-heading text-lg font-bold text-text-primary md:text-xl">{post.title}</h3>
                        {post.subtitle ? (
                          <p className="mt-2 text-sm text-text-secondary md:text-base">{post.subtitle}</p>
                        ) : null}
                        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-primary md:mt-4">
                          Mehr lesen <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </p>
                        <p className="mt-2 text-xs text-text-muted">{formatDate(post.published_at)}</p>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              </li>
            ))}
          </ul>
        </div>
        <ScrollReveal>
          <div className="mt-10 text-center sm:mt-12">
            <Link
              href="/aktuelles"
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full border border-primary/25 bg-bg-card px-6 py-3 text-sm font-semibold text-primary transition hover:bg-bg-secondary"
            >
              Alle Beiträge ansehen
            </Link>
          </div>
          <SectionCta className="mt-10" label="Jetzt Termin anfragen" />
        </ScrollReveal>
      </Container>
    </section>
  );
}
