import { type ReactNode } from "react";
import { Heart } from "lucide-react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  align?: "center" | "left";
  id?: string;
}

export function SectionHeading({
  title,
  subtitle,
  children,
  align = "center",
  id,
}: SectionHeadingProps) {
  return (
    <div className={`mb-10 text-center sm:mb-14 md:mb-20 lg:mb-24 ${align === "center" ? "" : "text-left"}`}>
      <div className={`mb-7 flex items-center gap-3 sm:mb-10 sm:gap-5 ${align === "center" ? "" : "max-w-xl"}`}>
        {align === "center" && <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-divider to-divider sm:block" />}
        <div className="flex shrink-0 flex-col items-center gap-2 sm:flex-row sm:gap-3">
          <Heart className="hidden h-3.5 w-3.5 fill-accent-heart/40 text-accent-heart sm:block" aria-hidden />
          <h2
            id={id}
            className="section-heading-title font-heading text-[1.75rem] font-bold leading-[1.15] tracking-tight text-text-primary sm:text-3xl sm:leading-tight md:text-[2.5rem] lg:text-[2.85rem]"
          >
            {title}
          </h2>
          <Heart className="hidden h-3.5 w-3.5 fill-accent-heart/40 text-accent-heart sm:block" aria-hidden />
        </div>
        {align === "center" && <div className="hidden h-px flex-1 bg-gradient-to-l from-transparent via-divider to-divider sm:block" />}
      </div>
      {subtitle && (
        <p
          className={`mx-auto max-w-2xl text-[0.9375rem] leading-relaxed text-text-secondary sm:text-lg sm:leading-8 md:text-xl md:leading-9 ${align === "center" ? "" : "mx-0"}`}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
