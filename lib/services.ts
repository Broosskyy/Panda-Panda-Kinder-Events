export interface Service {
  iconKey: string;
  title: string;
  description: string;
  detailText?: string;
  imageUrl?: string;
  buttonLabel?: string;
  buttonLink?: string;
  category?: string;
  priceFrom?: string;
  highlights?: string[];
}

export const services: Service[] = [
  {
    iconKey: "Paintbrush",
    title: "Kinderschminken",
    category: "Schminken & Kreativ",
    description: "Kreative Schmink-Designs für jedes Kinderherz — von Tigern bis zu Prinzessinnen.",
    detailText:
      "Unsere Betreuerinnen verwandeln Kinder in ihre Lieblingsfiguren — mit hautfreundlichen Farben, liebevoll und altersgerecht. Ideal für Geburtstage, Hochzeiten und Feste.",
    buttonLabel: "Mehr erfahren",
    buttonLink: "#kontakt",
  },
  {
    iconKey: "Heart",
    title: "Hochzeiten",
    category: "Events",
    description: "Liebevolle Kinderbetreuung auf eurer Feier, damit alle unbeschwert feiern können.",
    buttonLink: "#kontakt",
  },
  {
    iconKey: "Cake",
    title: "Kindergeburtstage",
    category: "Geburtstage",
    description: "Unvergessliche Geburtstags-Events mit Programm, Spielen und viel Spaß.",
    buttonLink: "#kontakt",
  },
  {
    iconKey: "Building2",
    title: "Firmenevents",
    category: "Business",
    description: "Familienfreundliche Betreuung bei Sommerfesten, Weihnachtsfeiern und Firmenevents.",
    buttonLink: "#kontakt",
  },
  {
    iconKey: "PartyPopper",
    title: "Feste & Feiern",
    category: "Events",
    description: "Betreuung bei Einschulung, Taufe, Jubiläum und anderen besonderen Anlässen.",
    buttonLink: "#kontakt",
  },
  {
    iconKey: "Sparkles",
    title: "Kreative Workshops",
    category: "Workshops",
    description: "Basteln, Malen und gemeinsam Gestalten — für kleine Künstler und Entdecker.",
    buttonLink: "#kontakt",
  },
  {
    iconKey: "Users",
    title: "Spiele & Bewegung",
    category: "Aktivitäten",
    description: "Altersgerechte Spiele und Aktivitäten, die Kinder in Bewegung bringen.",
    buttonLink: "#kontakt",
  },
  {
    iconKey: "Star",
    title: "Individuelle Konzepte",
    category: "Individuell",
    description: "Maßgeschneiderte Events nach euren Wünschen — wir gestalten euer Programm mit.",
    buttonLink: "#kontakt",
  },
];
