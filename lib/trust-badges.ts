import type { LucideIcon } from "lucide-react";
import { Award, Heart, MapPin, Shield } from "lucide-react";

export interface TrustBadge {
  icon: LucideIcon;
  text: string;
}

export const trustBadges: TrustBadge[] = [
  { icon: Award, text: "Erfahrenes Team" },
  { icon: Heart, text: "Mit Herz dabei" },
  { icon: Shield, text: "Sicher & zuverlässig" },
  { icon: MapPin, text: "Bundesweit im Einsatz" },
];
