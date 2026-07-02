export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "In welchem Umkreis seid ihr im Einsatz?",
    answer:
      "Wir sind bundesweit im Einsatz — unser Schwerpunkt liegt in NRW. Die Anfahrt wird individuell mit euch besprochen.",
  },
  {
    question: "Wie viele Kinder könnt ihr betreuen?",
    answer:
      "Das hängt vom Event ab — in der Regel betreuen wir 5 bis 30 Kinder. Größere Gruppen sind auf Anfrage möglich.",
  },
  {
    question: "Was kostet ein Event?",
    answer:
      "Die Kosten richten sich nach Art, Dauer und Anzahl der Kinder. Nach eurer Anfrage erhaltet ihr ein unverbindliches Angebot.",
  },
  {
    question: "Was brauchen wir vor Ort?",
    answer:
      "Eine geeignete Räumlichkeit, ggf. Tische und Stühle sowie einen Stromanschluss. Alle Details besprechen wir im Vorgespräch.",
  },
  {
    question: "Geht auch eine kurzfristige Buchung?",
    answer:
      "Je nach Verfügbarkeit ist das manchmal möglich. Am besten fragt ihr frühzeitig an — wir geben unser Bestes!",
  },
  {
    question: "Wie läuft die Stornierung ab?",
    answer:
      "Die Stornierungsbedingungen findet ihr in unseren AGB. Bei Fragen meldet euch einfach — wir finden eine faire Lösung.",
  },
  {
    question: "Berücksichtigt ihr Allergien und Besonderheiten?",
    answer:
      "Ja, unbedingt! Bitte gebt bei der Anfrage alle relevanten Informationen an, damit wir jedes Kind sicher betreuen können.",
  },
  {
    question: "Für welches Alter sind eure Programme?",
    answer:
      "Unsere Programme richten sich in der Regel an Kinder von 3 bis 12 Jahren — altersgerecht angepasst.",
  },
];

export const eventTypes = [
  "Hochzeit",
  "Kindergeburtstag",
  "Firmenevent",
  "Einschulung / Taufe",
  "Sonstiges",
] as const;
