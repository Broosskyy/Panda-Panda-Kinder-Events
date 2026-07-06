export interface Service {
  iconKey: string;
  title: string;
  description: string;
  detailText?: string;
  imageUrl?: string;
  buttonLabel?: string;
  priceFrom?: string;
  highlights?: string[];
}

export const services: Service[] = [
  {
    iconKey: "Paintbrush",
    title: "Kinderschminken",
    description: "Kreative Schmink-Designs für jedes Kinderherz — von Tigern bis zu Prinzessinnen.",
    detailText:
      "Unsere Betreuerinnen verwandeln Kinder in ihre Lieblingsfiguren — mit hautfreundlichen Farben, liebevoll und altersgerecht. Ideal für Geburtstage, Hochzeiten und Feste.",
    buttonLabel: "Mehr erfahren",
  },
  {
    iconKey: "Heart",
    title: "Hochzeiten",
    description: "Liebevolle Kinderbetreuung auf eurer Feier, damit alle unbeschwert feiern können.",
  },
  {
    iconKey: "Cake",
    title: "Kindergeburtstage",
    description: "Unvergessliche Geburtstags-Events mit Programm, Spielen und viel Spaß.",
  },
  {
    iconKey: "Building2",
    title: "Firmenevents",
    description: "Familienfreundliche Betreuung bei Sommerfesten, Weihnachtsfeiern und Firmenevents.",
  },
  {
    iconKey: "PartyPopper",
    title: "Feste & Feiern",
    description: "Betreuung bei Einschulung, Taufe, Jubiläum und anderen besonderen Anlässen.",
  },
  {
    iconKey: "Sparkles",
    title: "Kreative Workshops",
    description: "Basteln, Malen und gemeinsam Gestalten — für kleine Künstler und Entdecker.",
  },
  {
    iconKey: "Users",
    title: "Spiele & Bewegung",
    description: "Altersgerechte Spiele und Aktivitäten, die Kinder in Bewegung bringen.",
  },
  {
    iconKey: "Star",
    title: "Individuelle Konzepte",
    description: "Maßgeschneiderte Events nach euren Wünschen — wir gestalten euer Programm mit.",
  },
];
