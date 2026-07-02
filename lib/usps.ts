import type { LucideIcon } from "lucide-react";
import { Heart, Palette, PartyPopper, Sparkles } from "lucide-react";

export interface Usp {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const usps: Usp[] = [
  {
    icon: Heart,
    title: "Liebevolle Betreuung",
    description:
      "Unser Team kümmert sich mit Geduld und Herz um jedes Kind — damit ihr euren Tag in vollen Zügen genießen könnt.",
  },
  {
    icon: Palette,
    title: "Kreative Programme",
    description:
      "Von Kinderschminken über Basteln bis zu Bewegungsspielen — altersgerecht und voller Ideen.",
  },
  {
    icon: PartyPopper,
    title: "Entspannte Eltern",
    description:
      "Wir übernehmen die Kinderbetreuung, damit ihr als Gastgeber oder Gast entspannt feiern könnt.",
  },
  {
    icon: Sparkles,
    title: "Zuverlässig & professionell",
    description:
      "Pünktlich, vorbereitet und mit klaren Absprachen — damit euer Event reibungslos verläuft.",
  },
];
