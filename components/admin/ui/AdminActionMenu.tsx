"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { AdminButton } from "./AdminButton";

export interface AdminActionMenuItem {
  id: string;
  label: string;
  onClick: () => void | Promise<void>;
  icon?: ReactNode;
  disabled?: boolean;
  hidden?: boolean;
}

interface AdminActionMenuProps {
  primary?: {
    label: string;
    onClick: () => void | Promise<void>;
    icon?: ReactNode;
    disabled?: boolean;
    variant?: "primary" | "secondary";
  };
  items: AdminActionMenuItem[];
  dangerItems?: AdminActionMenuItem[];
  className?: string;
}

export function AdminActionMenu({ primary, items, dangerItems = [], className = "" }: AdminActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const visibleItems = items.filter((item) => !item.hidden);
  const visibleDanger = dangerItems.filter((item) => !item.hidden);
  const hasMenu = visibleItems.length > 0 || visibleDanger.length > 0;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`admin-action-menu ${className}`}>
      {primary ? (
        <AdminButton
          variant={primary.variant ?? "primary"}
          icon={primary.icon}
          disabled={primary.disabled}
          className="admin-action-menu-primary"
          onClick={() => void primary.onClick()}
        >
          {primary.label}
        </AdminButton>
      ) : null}

      {hasMenu ? (
        <div className="admin-action-menu-more-wrap">
          <AdminButton
            variant="secondary"
            icon={<MoreHorizontal className="h-4 w-4" />}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((v) => !v)}
          >
            Mehr
          </AdminButton>

          {open ? (
            <div id={menuId} className="admin-action-menu-dropdown" role="menu">
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  className="admin-action-menu-item"
                  disabled={item.disabled}
                  onClick={() => {
                    setOpen(false);
                    void item.onClick();
                  }}
                >
                  {item.icon ? <span className="admin-action-menu-item-icon">{item.icon}</span> : null}
                  {item.label}
                </button>
              ))}
              {visibleDanger.length > 0 ? (
                <>
                  {visibleItems.length > 0 ? <div className="admin-action-menu-divider" role="separator" /> : null}
                  {visibleDanger.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      className="admin-action-menu-item admin-action-menu-item-danger"
                      disabled={item.disabled}
                      onClick={() => {
                        setOpen(false);
                        void item.onClick();
                      }}
                    >
                      {item.icon ? <span className="admin-action-menu-item-icon">{item.icon}</span> : null}
                      {item.label}
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
