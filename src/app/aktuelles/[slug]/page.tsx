import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { Container } from "@/components/ui/Container";
import { fetchPostBySlug, fetchSiteSettings } from "@/lib/cms/data";
import { articleJsonLd, buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);
  if (!post) return { title: "Beitrag nicht gefunden" };
  return buildPageMetadata({
    title: post.title,
    description: post.subtitle || post.content.slice(0, 160),
    path: `/aktuelles/${slug}`,
    image: post.hero_image_url ?? undefined,
  });
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([fetchPostBySlug(slug), fetchSiteSettings()]);

  if (!post) notFound();

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const jsonLd = articleJsonLd({
    title: post.title,
    description: post.subtitle || post.content.slice(0, 160),
    path: `/aktuelles/${slug}`,
    publishedAt: post.published_at,
    image: post.hero_image_url,
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main id="main-content" className="bg-bg-primary pt-24 sm:pt-28">
        <Container className="max-w-3xl py-10 sm:py-14">
          <Link
            href="/#aktuelles"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück zu Aktuelles
          </Link>

          <p className="mt-8 text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
          <h1 className="font-heading mt-3 text-3xl font-bold text-text-primary sm:text-4xl">{post.title}</h1>
          {post.subtitle ? <p className="mt-4 text-lg text-text-secondary">{post.subtitle}</p> : null}
          {date ? <p className="mt-4 text-sm text-text-muted">{date}</p> : null}

          {post.hero_image_url ? (
            <div className="relative mt-8 aspect-[16/10] w-full overflow-hidden rounded-2xl">
              <Image
                src={post.hero_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                unoptimized={post.hero_image_url.includes("supabase.co")}
              />
            </div>
          ) : null}

          <div className="prose-panda mt-10 space-y-5 text-base leading-relaxed text-text-secondary sm:text-lg sm:leading-8">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </main>
      <Footer contact={settings.contact} footer={settings.footer} />
      <WhatsAppFab contact={settings.contact} />
    </>
  );
}
