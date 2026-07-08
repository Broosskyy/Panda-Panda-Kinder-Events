"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, X } from "lucide-react";
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

function useIsMobileSheet() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return mobile;
}

export function AdminActionMenu({ primary, items, dangerItems = [], className = "" }: AdminActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const isMobileSheet = useIsMobileSheet();

  const visibleItems = items.filter((item) => !item.hidden);
  const visibleDanger = dangerItems.filter((item) => !item.hidden);
  const hasMenu = visibleItems.length > 0 || visibleDanger.length > 0;

  useEffect(() => {
    if (!open || isMobileSheet) return;
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
  }, [open, isMobileSheet]);

  useEffect(() => {
    if (!open || !isMobileSheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, isMobileSheet]);

  const renderMenuItem = (item: AdminActionMenuItem, danger = false) => (
    <button
      key={item.id}
      type="button"
      role="menuitem"
      className={`admin-action-menu-item${danger ? " admin-action-menu-item-danger" : ""}`}
      disabled={item.disabled}
      onClick={() => {
        setOpen(false);
        void item.onClick();
      }}
    >
      {item.icon ? <span className="admin-action-menu-item-icon">{item.icon}</span> : null}
      {item.label}
    </button>
  );

  const sheet =
    open && isMobileSheet && hasMenu
      ? createPortal(
          <div className="admin-action-sheet-root" role="presentation">
            <button
              type="button"
              className="admin-action-sheet-backdrop"
              aria-label="Menü schließen"
              onClick={() => setOpen(false)}
            />
            <div className="admin-action-sheet-panel" role="menu" id={menuId} aria-label="Weitere Aktionen">
              <div className="admin-action-sheet-handle" aria-hidden />
              <div className="admin-action-sheet-header">
                <span className="admin-action-sheet-title">Aktionen</span>
                <button type="button" className="admin-icon-btn" onClick={() => setOpen(false)} aria-label="Schließen">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="admin-action-sheet-body">
                {visibleItems.map((item) => renderMenuItem(item))}
                {visibleDanger.length > 0 ? (
                  <>
                    {visibleItems.length > 0 ? <div className="admin-action-menu-divider" role="separator" /> : null}
                    {visibleDanger.map((item) => renderMenuItem(item, true))}
                  </>
                ) : null}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

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

          {open && !isMobileSheet ? (
            <div id={menuId} className="admin-action-menu-dropdown" role="menu">
              {visibleItems.map((item) => renderMenuItem(item))}
              {visibleDanger.length > 0 ? (
                <>
                  {visibleItems.length > 0 ? <div className="admin-action-menu-divider" role="separator" /> : null}
                  {visibleDanger.map((item) => renderMenuItem(item, true))}
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {sheet}
    </div>
  );
}
