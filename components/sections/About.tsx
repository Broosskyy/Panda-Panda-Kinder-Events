import Image from "next/image";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function About() {
  return (
    <section id="ueber-uns" className="scroll-mt-24 py-16 md:py-20">
      <Container>
        <SectionHeading title="Über uns" subtitle="Die Panda-Bande — mit Herz für kleine Abenteurer." />
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-base leading-relaxed text-text-secondary md:text-lg">
              {siteConfig.name} wurde aus der Überzeugung geboren, dass Kinder auf Feiern
              nicht nur geduldet, sondern begeistert werden sollten. Unser Team aus erfahrenen
              Betreuern sorgt dafür, dass eure kleinen Gäste sich wohlfühlen, Spaß haben und
              voller schöner Erinnerungen nach Hause gehen.
            </p>
            <p className="mt-4 text-base leading-relaxed text-text-secondary md:text-lg">
              Ob Hochzeit, Geburtstag oder Firmenevent — wir gestalten altersgerechte Programme
              mit Kreativität, Geduld und echter Freude. Damit ihr als Eltern oder Gastgeber
              entspannt feiern könnt.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Mission", text: "Magische Momente für Kinder — sorgenfreie Erlebnisse für Familien." },
                { label: "Werte", text: "Spaß, Sicherheit, Inklusion, Vertrauen und Qualität." },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-bg-card p-5">
                  <p className="text-sm font-semibold text-primary">{item.label}</p>
                  <p className="mt-1 text-sm text-text-secondary">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop"
                alt="Panda-Bande Team bei der Arbeit"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 hidden h-24 w-24 md:block">
              <Image src="/panda-illustration.svg" alt="" width={96} height={96} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
