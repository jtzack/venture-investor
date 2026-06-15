import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/screener", label: "Screener" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/method", label: "Method" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-edge bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight text-accent">◢</span>
          <span className="font-semibold tracking-tight">Venture Investor</span>
          <span className="hidden text-xs text-muted sm:inline">
            asymmetric small-cap screener
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-slate-300 transition hover:bg-panel2 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
