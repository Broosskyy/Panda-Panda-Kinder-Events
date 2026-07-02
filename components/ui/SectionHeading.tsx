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
    <div className={`mb-12 md:mb-16 ${align === "center" ? "text-center" : "text-left"}`}>
      <div className={`mb-8 flex items-center gap-4 ${align === "center" ? "" : "max-w-xl"}`}>
        {align === "center" && <div className="h-px flex-1 bg-divider" />}
        <div className="flex shrink-0 items-center gap-2.5">
          <Heart className="h-3.5 w-3.5 fill-accent-heart/60 text-accent-heart" aria-hidden />
          <h2
            id={id}
            className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl md:text-4xl"
          >
            {title}
          </h2>
          <Heart className="h-3.5 w-3.5 fill-accent-heart/60 text-accent-heart" aria-hidden />
        </div>
        {align === "center" && <div className="h-px flex-1 bg-divider" />}
      </div>
      {subtitle && (
        <p className={`mx-auto max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg md:leading-8 ${align === "center" ? "" : "mx-0"}`}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
