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
    <div className={`mb-8 text-center sm:mb-12 md:mb-16 lg:mb-20 ${align === "center" ? "" : "text-left"}`}>
      <div className={`mb-6 flex items-center gap-3 sm:mb-8 sm:gap-5 ${align === "center" ? "" : "max-w-xl"}`}>
        {align === "center" && <div className="hidden h-px flex-1 bg-divider sm:block" />}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Heart className="hidden h-4 w-4 fill-accent-heart/50 text-accent-heart sm:block" aria-hidden />
          <h2
            id={id}
            className="font-heading text-[1.65rem] font-bold leading-snug tracking-tight text-text-primary sm:text-3xl sm:leading-tight md:text-4xl lg:text-[2.75rem]"
          >
            {title}
          </h2>
          <Heart className="hidden h-4 w-4 fill-accent-heart/50 text-accent-heart sm:block" aria-hidden />
        </div>
        {align === "center" && <div className="hidden h-px flex-1 bg-divider sm:block" />}
      </div>
      {subtitle && (
        <p
          className={`mx-auto max-w-2xl text-[0.9375rem] leading-relaxed text-text-secondary sm:text-lg md:text-xl md:leading-9 ${align === "center" ? "" : "mx-0"}`}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
