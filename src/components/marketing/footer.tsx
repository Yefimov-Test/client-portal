export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-lg font-semibold tracking-tight">
              Apex<span className="text-primary">.</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Strategic consulting for growing businesses
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            hello@apexstrategy.com
          </div>
        </div>
      </div>
    </footer>
  );
}
