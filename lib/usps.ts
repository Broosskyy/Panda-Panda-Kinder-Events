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
    title: "Mit Herz",
    description:
      "Liebevolle Betreuung mit Geduld und Einfühlungsvermögen — jedes Kind fühlt sich gesehen.",
  },
  {
    icon: Palette,
    title: "Kreativ",
    description:
      "Altersgerechte Programme voller Ideen — von Schminken bis zu Bewegungsspielen.",
  },
  {
    icon: Sparkles,
    title: "Professionell",
    description:
      "Geschultes Team, klare Absprachen und zuverlässige Umsetzung auf höchstem Niveau.",
  },
  {
    icon: PartyPopper,
    title: "Zuverlässig",
    description:
      "Pünktlich, vorbereitet und flexibel — damit euer Event reibungslos verläuft.",
  },
];
