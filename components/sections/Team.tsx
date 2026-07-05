import Image from "next/image";
import type { SitePublicTeamSettings, SiteSectionHeading } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionCta } from "@/components/ui/SectionCta";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface TeamProps {
  team?: SitePublicTeamSettings;
  heading?: SiteSectionHeading;
}

export function Team({
  team = DEFAULT_SITE_SETTINGS.publicTeam,
  heading = DEFAULT_SITE_SETTINGS.sections.team,
}: TeamProps) {
  const items = team.items?.length ? team.items : DEFAULT_SITE_SETTINGS.publicTeam.items;
  if (!items.length) return null;

  return (
    <section id="team" className="section-padding bg-bg-secondary/30">
      <Container>
        <ScrollReveal>
          <SectionHeading title={heading.title ?? team.title} subtitle={heading.subtitle ?? team.subtitle} />
        </ScrollReveal>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8" role="list">
          {items.map((member, i) => (
            <li key={`${member.name}-${i}`}>
              <ScrollReveal delay={i * 80}>
                <Card className="card-equal h-full overflow-hidden !p-0" padding="sm" hover>
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-bg-secondary">
                    <Image
                      src={member.imageUrl}
                      alt={`${member.name} — ${member.role}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5 md:p-6">
                    <h3 className="font-heading text-xl font-bold text-text-primary">{member.name}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-secondary">{member.description}</p>
                  </div>
                </Card>
              </ScrollReveal>
            </li>
          ))}
        </ul>

        <ScrollReveal>
          <SectionCta className="mt-12 sm:mt-16" />
        </ScrollReveal>
      </Container>
    </section>
  );
}
