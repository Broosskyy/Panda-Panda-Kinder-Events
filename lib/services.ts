import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Cake,
  Heart,
  Paintbrush,
  PartyPopper,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

export interface Service {
  icon: LucideIcon;
  title: string;
  description: string;
  detailText?: string;
  imageUrl?: string;
  buttonLabel?: string;
}

export const services: Service[] = [
  {
    icon: Paintbrush,
    title: "Kinderschminken",
    description: "Kreative Schmink-Designs für jedes Kinderherz — von Tigern bis zu Prinzessinnen.",
    detailText:
      "Unsere Betreuerinnen verwandeln Kinder in ihre Lieblingsfiguren — mit hautfreundlichen Farben, liebevoll und altersgerecht. Ideal für Geburtstage, Hochzeiten und Feste.",
    buttonLabel: "Mehr erfahren",
  },
  {
    icon: Heart,
    title: "Hochzeiten",
    description: "Liebevolle Kinderbetreuung auf eurer Feier, damit alle unbeschwert feiern können.",
  },
  {
    icon: Cake,
    title: "Kindergeburtstage",
    description: "Unvergessliche Geburtstags-Events mit Programm, Spielen und viel Spaß.",
  },
  {
    icon: Building2,
    title: "Firmenevents",
    description: "Familienfreundliche Betreuung bei Sommerfesten, Weihnachtsfeiern und Firmenevents.",
  },
  {
    icon: PartyPopper,
    title: "Feste & Feiern",
    description: "Betreuung bei Einschulung, Taufe, Jubiläum und anderen besonderen Anlässen.",
  },
  {
    icon: Sparkles,
    title: "Kreative Workshops",
    description: "Basteln, Malen und gemeinsam Gestalten — für kleine Künstler und Entdecker.",
  },
  {
    icon: Users,
    title: "Spiele & Bewegung",
    description: "Altersgerechte Spiele und Aktivitäten, die Kinder in Bewegung bringen.",
  },
  {
    icon: Star,
    title: "Individuelle Konzepte",
    description: "Maßgeschneiderte Events nach euren Wünschen — wir gestalten euer Programm mit.",
  },
];
