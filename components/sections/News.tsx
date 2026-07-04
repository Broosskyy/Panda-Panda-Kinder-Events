import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CmsPost } from "@/lib/cms/types";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface NewsProps {
  posts: CmsPost[];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function News({ posts }: NewsProps) {
  if (!posts.length) return null;

  return (
    <section id="aktuelles" className="scroll-mt-24 section-padding bg-bg-primary">
      <Container>
        <ScrollReveal>
          <SectionHeading
            title="Aktuelles"
            subtitle="Neuigkeiten, Tipps und Einblicke von der Panda-Bande."
          />
        </ScrollReveal>

        <div className="swipe-bleed md:hidden">
          <div className="swipe-track" role="region" aria-label="Aktuelles — horizontal scrollen">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/aktuelles/${post.slug}`}
                className="swipe-item block w-[min(88vw,22rem)]"
              >
                <Card className="h-full overflow-hidden !p-0" padding="sm" hover>
                  {post.hero_image_url ? (
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src={post.hero_image_url}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="88vw"
                        unoptimized={post.hero_image_url.includes("supabase.co")}
                      />
                    </div>
                  ) : null}
                  <div className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
                    <h3 className="mt-2 font-heading text-lg font-bold text-text-primary">{post.title}</h3>
                    {post.subtitle ? <p className="mt-2 text-sm text-text-secondary">{post.subtitle}</p> : null}
                    <p className="mt-3 text-xs text-text-muted">{formatDate(post.published_at)}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden gap-8 md:grid md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <ScrollReveal key={post.id} delay={i * 80}>
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
                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
                    <h3 className="mt-2 font-heading text-xl font-bold text-text-primary">{post.title}</h3>
                    {post.subtitle ? <p className="mt-2 text-base text-text-secondary">{post.subtitle}</p> : null}
                    <p className="mt-4 flex items-center gap-2 text-sm font-medium text-primary">
                      Weiterlesen <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </p>
                    <p className="mt-2 text-xs text-text-muted">{formatDate(post.published_at)}</p>
                  </div>
                </Card>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
