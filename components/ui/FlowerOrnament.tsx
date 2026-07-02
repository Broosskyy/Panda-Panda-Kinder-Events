interface FlowerOrnamentProps {
  className?: string;
  variant?: "left" | "right";
}

export function FlowerOrnament({ className = "", variant = "left" }: FlowerOrnamentProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`pointer-events-none select-none text-primary/20 ${variant === "right" ? "scale-x-[-1]" : ""} ${className}`}
      aria-hidden
    >
      <path
        d="M20 80C35 55 55 45 75 30C60 50 50 70 45 95C35 85 25 82 20 80Z"
        fill="currentColor"
        opacity="0.35"
      />
      <path
        d="M85 25C70 40 65 55 60 75C75 60 90 45 95 25C92 22 88 23 85 25Z"
        fill="currentColor"
        opacity="0.25"
      />
      <circle cx="30" cy="35" r="4" fill="currentColor" opacity="0.2" />
      <circle cx="95" cy="70" r="3" fill="currentColor" opacity="0.15" />
      <path
        d="M10 100 Q40 90 55 70"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.2"
        fill="none"
      />
    </svg>
  );
}
