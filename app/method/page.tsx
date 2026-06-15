import Link from "next/link";

export const metadata = { title: "Method — Venture Investor" };

const FACTORS = [
  {
    name: "Revenue growth",
    weight: "35%",
    detail:
      "The single most predictive factor for hockey-stick returns. 30%+ YoY clears the bar; 50%+ is elite. Declining revenue is heavily penalized.",
  },
  {
    name: "Gross margins",
    weight: "20%",
    detail:
      "High, durable gross margins (50%+, software-like is best) mean growth can fund itself and compound. Thin margins cap the upside.",
  },
  {
    name: "Cash flow",
    weight: "15%",
    detail:
      "Free-cash-flow margin. Positive or near-breakeven is rewarded; deep, persistent cash burn is punished because it risks dilution.",
  },
  {
    name: "Market-cap fit",
    weight: "10%",
    detail:
      "Peaks in the $500M–$5B band that institutions largely ignore — the asymmetric sweet spot. Mega-caps score low because the easy multiples are gone.",
  },
  {
    name: "Founder-led",
    weight: "10%",
    detail:
      "Founder-CEOs think in decades and own real equity. Most generational winners were founder-led for a long time.",
  },
  {
    name: "Theme tailwind",
    weight: "10%",
    detail:
      "Every name rides at least one major shift — AI infra, robotics, defense tech, energy storage, nuclear, digital health, cybersecurity, space, fintech. Multiple overlapping tailwinds score higher.",
  },
];

export default function MethodPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">How the score works</h1>
        <p className="mt-2 text-sm text-muted">
          The composite is a 0–100 weighted average of six factors drawn from how
          the biggest public-market winners actually started: small, fast-growing
          real businesses riding a massive wave. It is a way to{" "}
          <span className="text-slate-200">rank and prioritize research</span>,
          not a buy signal.
        </p>
      </div>

      <div className="space-y-3">
        {FACTORS.map((f) => (
          <div key={f.name} className="card p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{f.name}</h2>
              <span className="chip border-accent/30 bg-accent/10 text-accent">
                {f.weight}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">{f.detail}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">What the score is not</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">
          <li>Not a valuation. A great business can still be a bad price.</li>
          <li>Not a prediction. It measures fit to a pattern, not the future.</li>
          <li>
            Not a substitute for reading. The edge is the 15-minute weekly read
            of earnings calls — the screener just tells you where to point it.
          </li>
        </ul>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold">Where the data comes from</h2>
        <p className="mt-2 text-sm text-slate-400">
          Static facts (sector, theme, founder-led) are curated by hand in the
          repo and should be re-verified — CEOs change. Live fundamentals are
          pulled from Yahoo Finance at request time and cached for 30 minutes. If
          the provider can&apos;t be reached, the app says so rather than showing
          fabricated numbers.
        </p>
        <p className="mt-3 text-sm text-slate-400">
          Want a name added? Edit{" "}
          <span className="font-mono text-slate-300">lib/universe.ts</span> — the
          screener picks it up automatically.
        </p>
      </div>

      <Link href="/screener" className="btn border-accent/40 bg-accent/10 text-accent">
        ← Back to the screener
      </Link>
    </div>
  );
}
