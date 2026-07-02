import Image from "next/image";
import { processSteps } from "@/lib/process-steps";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Process() {
  return (
    <section id="ablauf" className="scroll-mt-24 py-16 md:py-20">
      <Container>
        <SectionHeading
          title="So einfach buchst du uns"
          subtitle="In fünf Schritten zu eurem unvergesslichen Event."
        />
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {processSteps.map((step, index) => (
              <div key={step.number} className="relative flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-text-inverse">
                  {step.number}
                </div>
                <div className={index < processSteps.length - 1 ? "pb-2" : ""}>
                  <h3 className="font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative mx-auto hidden w-56 lg:block xl:w-64">
            <Image
              src="/panda-illustration.svg"
              alt="Panda-Maskottchen der Panda-Bande"
              width={256}
              height={280}
              className="w-full"
            />
            <div className="absolute -top-2 right-0 max-w-[180px] rounded-2xl rounded-br-sm bg-bg-card px-4 py-3 text-sm shadow-md">
              Wir kümmern uns um den Rest!
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
