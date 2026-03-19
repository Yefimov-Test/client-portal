import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    title: "Growth Strategy",
    description:
      "Figure out where your business should go next. We analyze your market, competitors, and internal strengths to build a roadmap that actually makes sense.",
    accent: true,
  },
  {
    title: "Marketing",
    description:
      "Stop spending money on channels that don't convert. We build marketing systems that bring qualified leads consistently.",
    accent: false,
  },
  {
    title: "Operations",
    description:
      "Eliminate bottlenecks, automate what can be automated, and build processes that scale with your team.",
    accent: false,
  },
];

export function Services() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-medium uppercase tracking-widest text-primary">
          What we do
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Three areas. Full focus.
        </h2>

        <div className="mt-12 grid gap-6 md:grid-cols-[1.3fr_1fr] lg:gap-8">
          <Card className={`border-primary/20 bg-primary/5 row-span-1`}>
            <CardContent className="flex flex-col gap-4 p-8">
              <h3 className="text-xl font-semibold">{services[0].title}</h3>
              <p className="leading-relaxed text-muted-foreground">
                {services[0].description}
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-6 lg:gap-8">
            {services.slice(1).map((service) => (
              <Card key={service.title} className="border-border/50">
                <CardContent className="flex flex-col gap-3 p-6">
                  <h3 className="text-lg font-semibold">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
