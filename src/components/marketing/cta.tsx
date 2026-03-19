export function CTA() {
  return (
    <section className="py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-2xl bg-primary/5 border border-primary/10 px-8 py-16 text-center sm:px-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to grow?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Book a free 30-minute call. No sales pitch, no pressure. Just a
            conversation about where your business is and where it could be.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Book Your Free Call
          </a>
        </div>
      </div>
    </section>
  );
}
