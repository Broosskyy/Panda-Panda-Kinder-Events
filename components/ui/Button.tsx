import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  href?: string;
  children: ReactNode;
  icon?: ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-text-inverse hover:bg-primary-hover shadow-sm",
  secondary:
    "bg-bg-card text-text-primary border border-text-primary hover:bg-bg-secondary",
  ghost:
    "bg-transparent text-text-primary border border-border hover:bg-bg-secondary",
};

export function Button({
  variant = "primary",
  href,
  children,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const classes = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-medium transition-all duration-150 ${variants[variant]} ${className}`;

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
