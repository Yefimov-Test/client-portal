export function Process() {
  const steps = [
    {
      number: "01",
      title: "Discovery Call",
      description: "30 minutes. We listen, ask questions, understand your situation.",
    },
    {
      number: "02",
      title: "Strategy & Plan",
      description:
        "We build a clear action plan with priorities, timelines, and expected outcomes.",
    },
    {
      number: "03",
      title: "Execution Support",
      description:
        "We work alongside you. Weekly check-ins, real adjustments, measurable progress.",
    },
  ];

  return (
    <section className="bg-card/50 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          How it works
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Simple process. Real results.
        </h2>

        <div className="mt-12 flex flex-col gap-0">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="group flex gap-6 border-l-2 border-border/50 py-8 pl-8 transition-colors hover:border-primary"
            >
              <span className="font-mono text-3xl font-bold text-muted-foreground/30 transition-colors group-hover:text-primary/60">
                {step.number}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
