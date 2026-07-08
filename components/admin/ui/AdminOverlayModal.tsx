"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface AdminOverlayModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
  size?: "md" | "lg";
}

export function AdminOverlayModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  labelledBy,
  size = "md",
}: AdminOverlayModalProps) {
  const fallbackId = useId();
  const titleId = labelledBy ?? `${fallbackId}-title`;
  const scrollLockY = useRef(0);

  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      root.removeAttribute("data-admin-overlay-modal");
      return;
    }

    scrollLockY.current = window.scrollY;
    root.setAttribute("data-admin-overlay-modal", "open");

    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollLockY.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.removeAttribute("data-admin-overlay-modal");
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollLockY.current);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="admin-overlay-modal-root" role="presentation">
      <button type="button" className="admin-overlay-modal-backdrop" onClick={onClose} aria-label="Schließen" />
      <div
        className={`admin-overlay-modal-panel admin-overlay-modal-panel--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="admin-overlay-modal-header">
          <div className="min-w-0">
            <h2 id={titleId} className="admin-overlay-modal-title">
              {title}
            </h2>
            {subtitle ? <p className="admin-overlay-modal-subtitle">{subtitle}</p> : null}
          </div>
          <button type="button" className="admin-icon-btn shrink-0" onClick={onClose} aria-label="Schließen">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="admin-overlay-modal-body">{children}</div>
        {footer ? <div className="admin-overlay-modal-footer">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
