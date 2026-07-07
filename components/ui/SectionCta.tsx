import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TRUST_POINTS = ["Kostenlos", "Unverbindlich", "Persönliche Rückmeldung"] as const;

interface SectionCtaProps {
  label?: string;
  className?: string;
}

export function SectionCta({ label = "Kostenlos anfragen", className = "" }: SectionCtaProps) {
  return (
    <div className={`section-cta ${className}`}>
      <ul className="mb-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-text-secondary" aria-label="Vorteile">
        {TRUST_POINTS.map((point) => (
          <li key={point} className="inline-flex items-center gap-1.5">
            <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
      <Button href="#kontakt" size="lg" className="min-h-[3rem] w-full shadow-lg sm:w-auto">
        {label}
      </Button>
    </div>
  );
}
