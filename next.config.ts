import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Canonical URLs use trailing slashes — required for /admin/ SW scope match. */
  trailingSlash: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/admin/sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/admin/" },
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/admin/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
