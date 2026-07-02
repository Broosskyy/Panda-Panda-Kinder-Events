import { type ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Container({ children, className = "", id }: ContainerProps) {
  return (
    <div id={id} className={`mx-auto w-full max-w-[1200px] px-5 md:px-10 ${className}`}>
      {children}
    </div>
  );
}
