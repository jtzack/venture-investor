import Link from "next/link";
import { notFound } from "next/navigation";
import Breakdown from "@/components/Breakdown";
import Flags from "@/components/Flags";
import RefreshButton from "@/components/RefreshButton";
import ScoreBadge from "@/components/ScoreBadge";
import WatchlistStar from "@/components/WatchlistStar";
import { fmtMoney, fmtPct, fmtPrice } from "@/lib/format";
import { getCompany } from "@/lib/screen";

export const dynamic = "force-dynamic";

export default async function CompanyPage({
  params,
}: {
  params: { ticker: string };
}) {
  const c = await getCompany(params.ticker);
  if (!c) notFound();

  const m = c.metrics;
  const t = c.entry.ticker;

  const links = [
    { label: "Yahoo Finance", href: `https://finance.yahoo.com/quote/${t}` },
    { label: "Earnings transcripts", href: `https://seekingalpha.com/symbol/${t}/earnings/transcripts` },
    { label: "SEC filings", href: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${t}&type=10-K` },
    { label: "Finviz", href: `https://finviz.com/quote.ashx?t=${t}` },
  ];

  return (
    <div className="space-y-6">
      <Link href="/screener" className="text-sm text-muted hover:text-slate-200">
        ← Back to screener
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <ScoreBadge score={c.score} size="lg" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {c.entry.name}{" "}
              <span className="font-mono text-muted">({t})</span>
            </h1>
            <p className="mt-1 text-sm text-muted">
              {c.entry.themes.join(" · ")}
              {c.entry.founderLed && c.entry.founder
                ? ` · 👤 Founder-led (${c.entry.founder})`
                : " · Not founder-led"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <WatchlistStar ticker={t} withLabel />
          <RefreshButton endpoint={`/api/company/${t}?refresh=1`} />
        </div>
      </header>

      <p className="max-w-3xl text-slate-300">{c.entry.blurb}</p>
      <div className="card max-w-3xl border-accent/20 bg-accent/5 p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-accent">
          Thesis
        </div>
        <p className="mt-1 text-sm text-slate-200">{c.entry.thesis}</p>
      </div>

      <Flags flags={c.flags} />

      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        {/* Live metrics */}
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Live fundamentals
          </h2>
          {!m.fetched && (
            <p className="mb-3 rounded-lg border border-warn/30 bg-warn/10 p-2 text-xs text-warn">
              Couldn&apos;t reach the data provider — numbers below are pending.
            </p>
          )}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Metric label="Price" value={fmtPrice(m.price)} />
            <Metric label="Market cap" value={fmtMoney(m.marketCap)} />
            <Metric label="Revenue (TTM)" value={fmtMoney(m.revenueTTM)} />
            <Metric
              label="Revenue growth (YoY)"
              value={fmtPct(m.revenueGrowthYoY, 1)}
              highlight={m.revenueGrowthYoY != null && m.revenueGrowthYoY >= 0.3}
            />
            <Metric label="Gross margin" value={fmtPct(m.grossMargin, 1)} />
            <Metric label="Operating margin" value={fmtPct(m.operatingMargin, 1)} />
            <Metric label="Free cash flow" value={fmtMoney(m.freeCashFlow)} />
            <Metric label="FCF margin" value={fmtPct(m.fcfMargin, 1)} />
            <Metric label="Debt / equity" value={fmtPct(m.debtToEquity, 0)} />
          </dl>
        </div>

        {/* Score breakdown */}
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
            Why this score
          </h2>
          <Breakdown breakdown={c.breakdown} />
          {c.dataIncomplete && (
            <p className="mt-3 text-xs text-muted">
              Some metrics were missing, so the score is weighted over the
              factors we could measure.
            </p>
          )}
        </div>
      </div>

      {/* Research links — the manual edge */}
      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-muted">
          Do the 15-minute read
        </h2>
        <p className="mb-3 text-sm text-slate-400">
          The screener surfaces candidates; conviction comes from reading. Start
          with the latest earnings call — listen for accelerating growth, big
          contracts, and demand outpacing supply.
        </p>
        <div className="flex flex-wrap gap-2">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={`tabular-nums ${highlight ? "font-semibold text-accent" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
