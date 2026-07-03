"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminSidebar";
import { Inbox, Image, Newspaper, Star } from "lucide-react";

interface Stats {
  newBookings: number;
  pendingReviews: number;
  galleryCount: number;
  postsCount: number;
}

export function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const cards = [
    { label: "Neue Anfragen", value: stats?.newBookings ?? "—", href: "/admin/anfragen", icon: Inbox },
    { label: "Offene Bewertungen", value: stats?.pendingReviews ?? "—", href: "/admin/bewertungen", icon: Star },
    { label: "Galerie Bilder", value: stats?.galleryCount ?? "—", href: "/admin/galerie", icon: Image },
    { label: "Beiträge", value: stats?.postsCount ?? "—", href: "/admin/beitraege", icon: Newspaper },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Willkommen im Panda-Bande CMS — hier siehst du den Überblick."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, href, icon: Icon }) => (
          <Link key={href} href={href}>
            <AdminCard className="transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <Icon className="h-8 w-8 text-primary/70" aria-hidden />
                <span className="font-heading text-3xl font-bold text-text-primary">{value}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-text-secondary">{label}</p>
            </AdminCard>
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/inhalte", label: "Hero & Kontakt bearbeiten" },
          { href: "/admin/galerie", label: "Galerie pflegen" },
          { href: "/admin/beitraege", label: "Beitrag erstellen" },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-5 py-4 text-sm font-medium text-primary hover:bg-primary/10"
          >
            → {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
