import type { LucideIcon } from "lucide-react";
import { Calendar, Clock, MapPin, PartyPopper, Users } from "lucide-react";

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Art der Veranstaltung",
    description: "Hochzeit, Geburtstag oder Firmenevent — erzählt uns, was ihr plant.",
    icon: PartyPopper,
  },
  {
    number: 2,
    title: "Adresse der Location",
    description: "Wo findet euer Event statt? Wir kommen zu euch.",
    icon: MapPin,
  },
  {
    number: 3,
    title: "Datum & Uhrzeit",
    description: "Wann soll unsere Panda-Bande eintreffen?",
    icon: Calendar,
  },
  {
    number: 4,
    title: "Dauer",
    description: "Wie lange braucht ihr unsere Betreuung?",
    icon: Clock,
  },
  {
    number: 5,
    title: "Anzahl der Kinder",
    description: "Damit wir das passende Team und Programm planen können.",
    icon: Users,
  },
];
