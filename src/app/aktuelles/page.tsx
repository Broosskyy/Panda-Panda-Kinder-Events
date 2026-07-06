import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicChrome } from "@/components/layout/PublicChrome";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { fetchPublishedPosts, fetchSiteSettings } from "@/lib/cms/data";
import { buildPageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "Aktuelles",
  description: "Neuigkeiten, Tipps und Einblicke von der Panda-Bande Kinderevents.",
  path: "/aktuelles",
});

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function AktuellesPage() {
  const [posts, settings] = await Promise.all([fetchPublishedPosts(50), fetchSiteSettings()]);

  return (
    <>
      <Header navigation={settings.navigation} branding={settings.branding} />
      <main id="main-content" className="bg-bg-primary pt-[max(6.5rem,calc(5rem+env(safe-area-inset-top,0px)))]">
        <Container className="max-w-5xl py-10 sm:py-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Zurück zur Startseite
          </Link>

          <h1 className="font-heading mt-8 text-3xl font-bold text-text-primary sm:text-4xl">Aktuelles</h1>
          <p className="mt-4 max-w-2xl text-lg text-text-secondary">
            Neuigkeiten, Tipps und Einblicke von der Panda-Bande.
          </p>

          {posts.length === 0 ? (
            <p className="mt-12 text-text-muted">Noch keine veröffentlichten Beiträge.</p>
          ) : (
            <ul className="mt-10 grid gap-8 sm:grid-cols-2" role="list">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link href={`/aktuelles/${post.slug}`} className="group block h-full">
                    <Card className="h-full overflow-hidden !p-0" padding="sm" hover>
                      {post.hero_image_url ? (
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                          <Image
                            src={post.hero_image_url}
                            alt=""
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            unoptimized={post.hero_image_url.includes("supabase.co")}
                          />
                        </div>
                      ) : null}
                      <div className="p-6">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
                        <h2 className="mt-2 font-heading text-xl font-bold text-text-primary">{post.title}</h2>
                        {post.subtitle ? <p className="mt-2 text-base text-text-secondary">{post.subtitle}</p> : null}
                        <p className="mt-3 text-sm text-text-muted">{formatDate(post.published_at)}</p>
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </main>
      <Footer contact={settings.contact} footer={settings.footer} branding={settings.branding} />
      <PublicChrome
        contact={settings.contact}
        ctaLabel={settings.navigation.ctaLabel}
        footer={settings.footer}
        cookieNoticeText={settings.legal.cookieNoticeText}
      />
    </>
  );
}
