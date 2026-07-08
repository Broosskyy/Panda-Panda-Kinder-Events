import Image from "next/image";
import type {
  SiteAboutSettings,
  SitePublicTeamSettings,
  SiteSectionHeading,
} from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { resolveSectionHeading } from "@/lib/cms/normalize-settings";
import { TeamMemberImage } from "@/components/ui/TeamMemberImage";
import { PORTRAIT_BLUR_DATA_URL } from "@/lib/image-placeholder";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { FlowerOrnament } from "@/components/ui/FlowerOrnament";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface AboutProps {
  about?: SiteAboutSettings;
  team?: SitePublicTeamSettings;
  heading?: SiteSectionHeading;
}

export function About({
  about = DEFAULT_SITE_SETTINGS.about,
  team,
  heading,
}: AboutProps) {
  const safeHeading = resolveSectionHeading(heading, "about");
  const aboutImage = about.imageUrl?.trim() || DEFAULT_SITE_SETTINGS.about.imageUrl;
  const contactName = about.founderName?.trim() || "Panda-Bande Team";
  const teamItems = team?.items?.filter((m) => m.name?.trim() && m.role?.trim()) ?? [];
  const teamHeading = team?.title?.trim() || "Unser Team";
  const teamSubtitle = team?.subtitle?.trim();

  return (
    <section id="ueber-uns" className="section-padding bg-bg-secondary/20">
      <Container>
        <ScrollReveal>
          <SectionHeading title={safeHeading.title} subtitle={safeHeading.subtitle} />
        </ScrollReveal>

        <div className="grid items-start gap-6 sm:gap-14 lg:grid-cols-2 lg:gap-20">
          <ScrollReveal>
            <div className="relative">
              <FlowerOrnament className="pointer-events-none absolute -left-2 -top-4 h-16 w-16 opacity-25 sm:-left-6 sm:-top-6 sm:h-24 sm:w-24 sm:opacity-35" />
              <div className="about-image-frame relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden">
                <Image
                  src={aboutImage}
                  alt={`${contactName} — Panda-Bande Kinderevents`}
                  fill
                  className="portrait-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={PORTRAIT_BLUR_DATA_URL}
                  unoptimized={aboutImage.includes("supabase.co")}
                />
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={120}>
            <div className="about-copy">
              <p className="font-accent text-xl leading-snug text-primary sm:text-2xl md:text-[1.85rem] md:leading-snug">
                {about.introText}
              </p>
              <p className="mt-6 text-base leading-relaxed text-text-secondary sm:mt-8 sm:text-lg sm:leading-8">
                {about.paragraph1}
              </p>
              <p className="mt-5 text-base leading-relaxed text-text-secondary sm:mt-6 sm:text-lg sm:leading-8">
                {about.paragraph2}
              </p>
            </div>
          </ScrollReveal>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 sm:gap-5">
          {[
            { label: "Unsere Mission", text: about.missionText },
            { label: "Unsere Werte", text: about.valuesText },
          ].map((item) => (
            <ScrollReveal key={item.label}>
              <div className="h-full rounded-[var(--radius-card)] border border-border/50 bg-bg-card p-5 shadow-sm sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary sm:text-sm">
                  {item.label}
                </p>
                <p className="mt-3 text-base leading-relaxed text-text-secondary">{item.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <div className="about-contact-card mt-6 rounded-[var(--radius-card)] border border-primary/15 bg-primary/5 p-4 sm:mt-10 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Persönliche Ansprechpartnerin</p>
            <p className="mt-2 font-heading text-xl font-bold text-text-primary">{contactName}</p>
            <p className="mt-1 text-sm text-text-secondary">Liebevolle Betreuung mit Erfahrung.</p>
          </div>
        </ScrollReveal>

        {teamItems.length > 0 ? (
          <div id="unser-team" className="mt-10 sm:mt-20">
            <ScrollReveal>
              <h3 className="font-heading text-center text-2xl font-bold text-text-primary sm:text-3xl">
                {teamHeading}
              </h3>
              {teamSubtitle ? (
                <p className="mx-auto mt-3 max-w-2xl text-center text-base text-text-secondary sm:text-lg">
                  {teamSubtitle}
                </p>
              ) : null}
            </ScrollReveal>

            <ul className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8" role="list">
              {teamItems.map((member, i) => (
                <li key={`${member.name}-${member.role}-${i}`}>
                  <ScrollReveal delay={i * 80}>
                    <Card className="team-card h-full overflow-hidden !p-0" padding="sm" hover>
                      <div className="team-card-image relative aspect-[4/3] w-full overflow-hidden bg-bg-secondary sm:aspect-[4/5]">
                        <TeamMemberImage
                          src={member.imageUrl}
                          name={member.name}
                          role={member.role}
                        />
                      </div>
                      <div className="p-5 md:p-6">
                        <h4 className="font-heading text-xl font-bold text-text-primary">{member.name}</h4>
                        <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                        {member.description ? (
                          <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-secondary">{member.description}</p>
                        ) : null}
                      </div>
                    </Card>
                  </ScrollReveal>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
