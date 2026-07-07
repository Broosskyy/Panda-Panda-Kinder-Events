import { type ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
  narrow?: boolean;
}

export function Container({ children, className = "", id, narrow }: ContainerProps) {
  const base = narrow ? "section-container section-container--narrow" : "section-container";
  return (
    <div id={id} className={`${base} ${className}`.trim()}>
      {children}
    </div>
  );
}
