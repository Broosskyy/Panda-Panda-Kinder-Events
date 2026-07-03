import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "beige";
}

const paddingMap = {
  sm: "p-6",
  md: "p-7 sm:p-9",
  lg: "p-8 sm:p-10 md:p-11",
};

export function Card({
  children,
  className = "",
  hover = true,
  padding = "md",
  variant = "default",
}: CardProps) {
  const variantClass = variant === "beige" ? "card-beige" : "";
  const hoverClass = hover ? "" : "hover:transform-none hover:shadow-md";

  return (
    <div
      className={`card-premium ${variantClass} ${paddingMap[padding]} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
