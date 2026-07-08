import { ICON_STROKE } from "@/lib/design";
import type { SiteUspsSettings } from "@/lib/cms/types";
import { DEFAULT_SITE_SETTINGS } from "@/lib/cms/defaults";
import { resolveContentIcon } from "@/lib/cms/icons";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface UspsProps {
  usps?: SiteUspsSettings;
}

export function Usps({ usps = DEFAULT_SITE_SETTINGS.usps }: UspsProps) {
  const items = usps.items?.length ? usps.items : DEFAULT_SITE_SETTINGS.usps.items;

  return (
    <section id="warum-panda-bande" className="section-padding border-y border-border/30 bg-bg-secondary/30">
      <Container>
        <ScrollReveal>
          <SectionHeading title={usps.title} subtitle={usps.subtitle} />
        </ScrollReveal>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-8" role="list">
          {items.map((usp, i) => {
            const Icon = resolveContentIcon(usp.iconKey);
            return (
              <li key={`${usp.title}-${i}`}>
                <ScrollReveal delay={i * 80}>
                  <Card
                    className={`h-full text-center sm:text-left lg:border-0 lg:bg-transparent lg:shadow-none lg:hover:shadow-none ${
                      i < items.length - 1 ? "lg:border-r lg:border-border/40 lg:rounded-none lg:pr-12" : ""
                    }`}
                    padding="md"
                    hover
                  >
                    <div className="icon-wrap mx-auto mb-4 h-14 w-14 sm:mx-0 sm:mb-5 lg:mx-auto lg:mb-6 lg:h-16 lg:w-16">
                      <Icon
                        className="h-7 w-7 text-primary sm:h-8 sm:w-8 lg:h-8 lg:w-8"
                        strokeWidth={ICON_STROKE}
                        aria-hidden
                      />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-text-primary lg:text-center">{usp.title}</h3>
                    <p className="mt-3 text-[0.9375rem] leading-relaxed text-text-secondary sm:text-base lg:text-center">
                      {usp.description}
                    </p>
                  </Card>
                </ScrollReveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
