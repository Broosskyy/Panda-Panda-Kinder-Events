import Image from "next/image";

interface LogoProps {
  variant?: "default" | "inverse";
  className?: string;
}

export function Logo({ variant = "default", className = "" }: LogoProps) {
  const textColor = variant === "inverse" ? "text-text-inverse" : "text-text-primary";
  const subColor = variant === "inverse" ? "text-white/80" : "text-text-muted";

  return (
    <a href="#startseite" className={`flex items-center gap-3 ${className}`} aria-label="Panda-Bande Kinderevents — Startseite">
      <div className="relative h-11 w-11 shrink-0 md:h-12 md:w-12">
        <Image
          src="/logo.svg"
          alt=""
          width={48}
          height={48}
          className="h-full w-full"
          priority
        />
      </div>
      <div className="leading-tight">
        <span className={`block text-xs font-bold tracking-[0.15em] md:text-sm ${textColor}`}>
          PANDA-BANDE
        </span>
        <span className={`block font-heading text-[10px] tracking-widest md:text-xs ${subColor}`}>
          KINDEREVENTS
        </span>
      </div>
    </a>
  );
}
