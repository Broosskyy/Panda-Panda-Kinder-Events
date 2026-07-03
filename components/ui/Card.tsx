import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "beige";
}

const paddingMap = {
  sm: "p-4 sm:p-6",
  md: "p-5 sm:p-7 md:p-9",
  lg: "p-5 sm:p-8 md:p-10 lg:p-11",
};

export function Card({
  children,
  className = "",
  hover = true,
  padding = "md",
  variant = "default",
}: CardProps) {
  const variantClass = variant === "beige" ? "card-beige" : "";
  const hoverClass = hover ? "" : "card-static";

  return (
    <div
      className={`card-premium ${variantClass} ${paddingMap[padding]} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
