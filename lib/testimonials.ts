export interface Testimonial {
  stars: number;
  text: string;
  author: string;
  event: string;
  image?: string;
}

export const testimonials: Testimonial[] = [
  {
    stars: 5,
    text: "Die Panda-Bande hat unsere Hochzeit gerettet! Unsere Kinder und die kleinen Gäste waren den ganzen Abend bestens betreut. Wir konnten endlich durchatmen und feiern.",
    author: "Anna & Marco",
    event: "Hochzeit",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    stars: 5,
    text: "Das Kinderschminken war der absolute Hit auf dem Geburtstag unserer Tochter! Professionell, liebevoll und mit so viel Geduld. Absolute Empfehlung!",
    author: "Sarah K.",
    event: "Kindergeburtstag",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    stars: 5,
    text: "Für unser Firmen-Sommerfest haben wir die Panda-Bande gebucht. Das Team war pünktlich, super vorbereitet und die Kinder hatten einen Riesenspaß.",
    author: "Thomas M.",
    event: "Firmenevent",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  },
  {
    stars: 5,
    text: "Von der ersten Anfrage bis zum Event alles reibungslos. Lisa und ihr Team sind einfach toll — herzlich, zuverlässig und mit tollen Ideen.",
    author: "Julia & Peter",
    event: "Einschulungsfeier",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
  },
];
