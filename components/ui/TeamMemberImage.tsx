import Image from "next/image";
import { PORTRAIT_BLUR_DATA_URL } from "@/lib/image-placeholder";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface TeamMemberImageProps {
  src?: string | null;
  name: string;
  role: string;
  fallbackSrc?: string;
  className?: string;
}

export function TeamMemberImage({
  src,
  name,
  role,
  fallbackSrc,
  className = "",
}: TeamMemberImageProps) {
  const imageSrc = src?.trim() || fallbackSrc?.trim() || "";

  if (!imageSrc) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-bg-secondary ${className}`}
        aria-hidden
      >
        <span className="font-heading text-3xl font-bold text-primary/70 sm:text-5xl">{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={`${name} — ${role}`}
      fill
      className={`portrait-cover ${className}`}
      sizes="(max-width: 768px) 100vw, 33vw"
      loading="lazy"
      placeholder="blur"
      blurDataURL={PORTRAIT_BLUR_DATA_URL}
      unoptimized={imageSrc.includes("supabase.co")}
    />
  );
}
