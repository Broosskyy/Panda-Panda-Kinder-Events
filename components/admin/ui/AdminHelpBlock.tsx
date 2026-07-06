import type { ReactNode } from "react";
import { Lightbulb, AlertTriangle, Info } from "lucide-react";

type AdminHelpVariant = "info" | "tip" | "warning";

interface AdminHelpBlockProps {
  title?: string;
  children: ReactNode;
  variant?: AdminHelpVariant;
  className?: string;
}

const variantIcon: Record<AdminHelpVariant, typeof Info> = {
  info: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
};

export function AdminHelpBlock({
  title,
  children,
  variant = "info",
  className = "",
}: AdminHelpBlockProps) {
  const Icon = variantIcon[variant];
  return (
    <div className={`admin-help-block admin-help-block-${variant} ${className}`}>
      <Icon className="admin-help-block-icon h-5 w-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="admin-help-block-title">{title}</p> : null}
        <div className="admin-help-block-body">{children}</div>
      </div>
    </div>
  );
}

interface AdminPageHelpProps {
  items: string[];
  className?: string;
}

/** „Was kann ich hier machen?“ — max. 3 Stichpunkte */
export function AdminPageHelp({ items, className = "" }: AdminPageHelpProps) {
  if (!items.length) return null;
  const bullets = items.slice(0, 3);
  return (
    <AdminHelpBlock title="Was kann ich hier machen?" variant="tip" className={className}>
      <ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-relaxed">
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </AdminHelpBlock>
  );
}
