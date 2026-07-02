import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6 sm:h-7 sm:w-7",
};

export function StarRating({ rating, max = 5, size = "md", className = "" }: StarRatingProps) {
  return (
    <div
      role="img"
      className={`flex gap-0.5 ${className}`}
      aria-label={`${rating} von ${max} Sternen`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeMap[size]} ${
            i < rating ? "fill-accent-gold text-accent-gold" : "text-text-muted/50"
          }`}
          aria-hidden
        />
      ))}
    </div>
  );
}
