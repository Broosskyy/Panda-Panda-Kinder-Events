import { AdminPageHelp } from "@/components/admin/ui/AdminHelpBlock";

export function AdminPageHeader({
  title,
  description,
  whereVisible,
  helpItems,
  children,
}: {
  title: string;
  description?: string;
  whereVisible?: string;
  helpItems?: string[];
  children?: React.ReactNode;
}) {
  return (
    <div className="admin-page-header-block">
      <div className="admin-page-header">
        <div className="min-w-0 flex-1">
          <h1 className="admin-page-title">{title}</h1>
          {description ? <p className="admin-page-description hidden sm:block">{description}</p> : null}
          {whereVisible ? (
            <p className="admin-page-where-visible hidden md:block">
              <span className="font-medium">Sichtbar:</span> {whereVisible}
            </p>
          ) : null}
        </div>
        {children ? <div className="admin-page-actions">{children}</div> : null}
      </div>
      {helpItems?.length ? <AdminPageHelp items={helpItems} /> : null}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  title,
  compact = false,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
  compact?: boolean;
}) {
  return (
    <div className={`admin-card ${compact ? "admin-card-compact" : ""} ${className}`}>
      {title ? <h2 className="admin-card-title">{title}</h2> : null}
      {children}
    </div>
  );
}

export function AdminPage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`admin-page ${className}`}>{children}</div>;
}
