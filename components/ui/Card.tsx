import { type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-5",
  md: "p-6 sm:p-8",
  lg: "p-8 sm:p-10",
};

export function Card({ children, className = "", hover = true, padding = "md" }: CardProps) {
  return (
    <div
      className={`card-premium ${paddingMap[padding]} ${hover ? "" : "hover:transform-none hover:shadow-md"} ${className}`}
    >
      {children}
    </div>
  );
}
