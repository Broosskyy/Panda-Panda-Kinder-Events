import Image from "next/image";
import { siteConfig } from "@/config/site";
import { trustBadges } from "@/lib/trust-badges";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function Hero() {
  return (
    <section id="startseite" className="scroll-mt-24 pt-24 pb-10 sm:pt-28 sm:pb-12 md:pt-32 md:pb-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1 className="font-heading text-3xl font-bold leading-tight text-text-primary sm:text-4xl md:text-5xl">
              {siteConfig.name}
            </h1>
            <p className="font-accent mt-3 text-2xl text-primary md:text-[1.375rem]">
              {siteConfig.tagline}{" "}
              <span className="text-accent-heart" aria-hidden>
                ♡
              </span>
            </p>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-text-secondary md:text-lg">
              Liebevolle Kinderbetreuung für Hochzeiten, Geburtstage und Familienfeiern.
              Wir sorgen dafür, dass eure kleinen Gäste strahlen — und ihr entspannt
              feiern könnt.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="#kontakt" className="w-full sm:w-auto">
                Jetzt anfragen
              </Button>
              <Button href="#leistungen" variant="secondary" className="w-full sm:w-auto">
                Unsere Leistungen
              </Button>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
                  <badge.icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
                  <span className="text-xs font-medium text-text-primary sm:text-sm">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              className="relative aspect-[4/5] w-full overflow-hidden"
              style={{
                borderRadius: "60% 40% 55% 45% / 50% 60% 40% 50%",
              }}
            >
              <Image
                src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&h=1000&fit=crop"
                alt="Panda-Bande Team bei der liebevollen Kinderbetreuung"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-4 left-4 right-4 rounded-xl bg-bg-card p-4 shadow-lg md:-left-6 md:max-w-[260px]">
              <div className="flex items-start gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop"
                    alt="Lisa"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Lisa</p>
                  <p className="text-xs text-text-muted">Gründerin der Panda-Bande</p>
                  <p className="mt-1 text-sm italic text-text-secondary">
                    &ldquo;Jedes Kind verdient einen Tag voller Abenteuer.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
