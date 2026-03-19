import Link from "next/link";

export default function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border/50 px-6 py-3">
        <h1 className="text-lg font-semibold tracking-tight">
          Apex Strategy <span className="text-muted-foreground font-normal">CRM</span>
        </h1>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to site
        </Link>
      </header>
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
