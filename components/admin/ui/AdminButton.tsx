import type { ButtonHTMLAttributes, ReactNode } from "react";

type AdminButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  href?: string;
  icon?: ReactNode;
  children: ReactNode;
}

const variantClass: Record<AdminButtonVariant, string> = {
  primary: "admin-btn-primary",
  secondary: "admin-btn-secondary",
  danger: "admin-btn-danger",
  ghost: "admin-btn-ghost",
};

export function AdminButton({
  variant = "primary",
  href,
  icon,
  className = "",
  children,
  ...props
}: AdminButtonProps) {
  const classes = `${variantClass[variant]} min-h-11 ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...props}>
      {icon}
      {children}
    </button>
  );
}
