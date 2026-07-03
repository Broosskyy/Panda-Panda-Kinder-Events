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
    "bg-primary text-text-inverse hover:bg-primary-hover shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]",
  secondary:
    "bg-bg-card/90 text-text-primary border border-primary/20 hover:border-primary/45 hover:bg-bg-secondary shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0",
  ghost:
    "bg-transparent text-text-primary border border-border/80 hover:bg-bg-secondary/80 hover:border-primary/25",
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
  const classes = `inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${variants[variant]} ${sizes[size]} ${focusRing} ${className}`;

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
