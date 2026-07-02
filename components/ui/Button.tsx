import { type ButtonHTMLAttributes, type ReactNode } from "react";

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
    "bg-primary text-text-inverse hover:bg-primary-hover shadow-md hover:shadow-lg active:scale-[0.98]",
  secondary:
    "bg-bg-card text-text-primary border border-primary/30 hover:border-primary hover:bg-bg-secondary shadow-sm",
  ghost:
    "bg-transparent text-text-primary border border-border hover:bg-bg-secondary",
};

const sizes = {
  default: "min-h-12 px-7 py-3.5 text-sm",
  lg: "min-h-14 px-8 py-4 text-base",
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
  const classes = `inline-flex items-center justify-center gap-2.5 rounded-full font-medium transition-all duration-300 ease-out ${variants[variant]} ${sizes[size]} ${className}`;

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
