import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type AdminButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AdminButtonVariant;
  href?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
  icon?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}

const variantClass: Record<AdminButtonVariant, string> = {
  primary: "admin-btn-primary",
  secondary: "admin-btn-secondary",
  danger: "admin-btn-danger",
  ghost: "admin-btn-ghost",
  success: "admin-btn-success",
};

export function AdminButton({
  variant = "primary",
  href,
  target,
  rel,
  icon,
  loading = false,
  className = "",
  children,
  disabled,
  ...props
}: AdminButtonProps) {
  const classes = `${variantClass[variant]} min-h-11 ${loading ? "admin-btn-loading" : ""} ${className}`;
  const content = (
    <>
      {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden /> : icon}
      {children ?? null}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        aria-busy={loading || undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <button type="button" className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      {content}
    </button>
  );
}
