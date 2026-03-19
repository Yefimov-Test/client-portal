import { LeadForm } from "./lead-form";

export function Hero() {
  return (
    <section id="contact" className="relative pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16 items-start">
          <div className="flex flex-col gap-6">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              Business Consulting
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Your business
              <br />
              can do{" "}
              <span className="text-primary">more</span>.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
              We help small businesses find clarity, build systems that work,
              and grow without chaos. No fluff, no frameworks for the sake of
              frameworks. Just strategy that fits your reality.
            </p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Free 30-min consultation
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              No commitment
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <LeadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
