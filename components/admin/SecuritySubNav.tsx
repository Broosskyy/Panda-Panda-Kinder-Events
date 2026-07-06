"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECURITY_NAV } from "@/lib/admin/security-nav";

export function SecuritySubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 border-b border-border pb-4" aria-label="Sicherheit">
      {SECURITY_NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active ? "bg-primary text-white" : "border border-border bg-bg-card text-text-secondary hover:border-primary/30"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
