import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { focusRing } from "@/lib/a11y";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  children: ReactNode;
  icon?: ReactNode;
  size?: "default" | "lg";
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-text-inverse hover:bg-primary-hover shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
  secondary:
    "bg-bg-card text-text-primary border-2 border-primary/25 hover:border-primary/60 hover:bg-bg-secondary shadow-sm hover:shadow-md",
  ghost:
    "bg-transparent text-text-primary border border-border hover:bg-bg-secondary hover:border-primary/30",
};

const sizes = {
  default: "min-h-11 min-w-11 px-5 py-3 text-[0.9375rem] tracking-wide sm:min-h-12 sm:px-8 sm:py-3.5 sm:text-base",
  lg: "min-h-12 min-w-12 px-6 py-3.5 text-[0.9375rem] font-semibold tracking-wide sm:min-h-[3.75rem] sm:min-w-[3.75rem] sm:px-10 sm:py-4 sm:text-base",
};

export function Button({
  variant = "primary",
  href,
  children,
  icon,
  size = "default",
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-all duration-300 ease-out ${variants[variant]} ${sizes[size]} ${focusRing} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {icon}
      {children}
    </button>
  );
}
