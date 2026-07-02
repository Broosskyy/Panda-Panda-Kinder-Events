import { type ReactNode } from "react";
import { Heart } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function SectionHeading({ title, subtitle, children }: SectionHeadingProps) {
  return (
    <div className="mb-10 text-center md:mb-14">
      <div className="mb-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-divider" />
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 fill-accent-heart text-accent-heart" aria-hidden />
          <h2 className="font-heading text-2xl font-bold text-text-primary md:text-3xl">
            {title}
          </h2>
          <Heart className="h-4 w-4 fill-accent-heart text-accent-heart" aria-hidden />
        </div>
        <div className="h-px flex-1 bg-divider" />
      </div>
      {subtitle && (
        <p className="mx-auto max-w-2xl text-base text-text-secondary md:text-lg">{subtitle}</p>
      )}
      {children}
    </div>
  );
}
