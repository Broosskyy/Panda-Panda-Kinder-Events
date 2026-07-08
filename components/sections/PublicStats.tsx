import type { SitePublicStatsSettings } from "@/lib/cms/types";
import { Container } from "@/components/ui/Container";

interface PublicStatsProps {
  stats?: SitePublicStatsSettings | null;
}

function formatStatValue(value: number): string {
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k`.replace(".", ",");
  }
  return String(value);
}

export function PublicStats({ stats }: PublicStatsProps) {
  if (!stats) return null;

  const items = [
    stats.eventsCount && stats.eventsCount > 0
      ? { value: formatStatValue(stats.eventsCount), label: "betreute Events" }
      : null,
    stats.childrenCount && stats.childrenCount > 0
      ? { value: formatStatValue(stats.childrenCount), label: "glückliche Kinder" }
      : null,
    stats.recommendationPercent && stats.recommendationPercent > 0
      ? { value: `${stats.recommendationPercent}%`, label: "Weiterempfehlung" }
      : null,
    stats.yearsExperience && stats.yearsExperience > 0
      ? { value: String(stats.yearsExperience), label: stats.yearsExperience === 1 ? "Jahr Erfahrung" : "Jahre Erfahrung" }
      : null,
  ].filter(Boolean) as { value: string; label: string }[];

  if (items.length === 0) return null;

  return (
    <section className="border-y border-border/50 bg-bg-secondary/40 py-7 sm:py-12" aria-label="Kennzahlen">
      <Container>
        <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-8" role="list">
          {items.map((item) => (
            <li key={item.label} className="text-center">
              <p className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{item.value}</p>
              <p className="mt-1 text-sm text-text-muted sm:text-base">{item.label}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
