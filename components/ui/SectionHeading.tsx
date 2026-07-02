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
    <div className={`mb-14 md:mb-20 ${align === "center" ? "text-center" : "text-left"}`}>
      <div className={`mb-10 flex items-center gap-5 ${align === "center" ? "" : "max-w-xl"}`}>
        {align === "center" && <div className="h-px flex-1 bg-divider" />}
        <div className="flex shrink-0 items-center gap-3">
          <Heart className="h-4 w-4 fill-accent-heart/50 text-accent-heart" aria-hidden />
          <h2
            id={id}
            className="font-heading text-3xl font-bold tracking-tight text-text-primary sm:text-4xl md:text-[2.75rem] md:leading-tight"
          >
            {title}
          </h2>
          <Heart className="h-4 w-4 fill-accent-heart/50 text-accent-heart" aria-hidden />
        </div>
        {align === "center" && <div className="h-px flex-1 bg-divider" />}
      </div>
      {subtitle && (
        <p
          className={`mx-auto max-w-2xl text-lg leading-relaxed text-text-secondary md:text-xl md:leading-9 ${align === "center" ? "" : "mx-0"}`}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
