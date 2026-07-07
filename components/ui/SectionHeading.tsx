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
  const centered = align === "center";

  return (
    <div className={`section-header ${centered ? "section-header--center" : "section-header--left"}`}>
      <div className="section-heading-row">
        {centered ? (
          <div className="section-heading-line section-heading-line--left hidden sm:block" aria-hidden />
        ) : null}
        <div className="section-heading-core">
          <Heart className="section-heading-heart hidden sm:block" aria-hidden />
          <h2
            id={id}
            className="section-heading-title font-heading text-[1.75rem] font-bold leading-[1.15] tracking-tight text-text-primary sm:text-3xl sm:leading-tight md:text-[2.5rem] lg:text-[2.85rem]"
          >
            {title}
          </h2>
          <Heart className="section-heading-heart hidden sm:block" aria-hidden />
        </div>
        {centered ? (
          <div className="section-heading-line section-heading-line--right hidden sm:block" aria-hidden />
        ) : null}
      </div>
      {subtitle ? (
        <p className={`section-prose ${centered ? "" : "section-prose-left"}`}>{subtitle}</p>
      ) : null}
      {children}
    </div>
  );
}
