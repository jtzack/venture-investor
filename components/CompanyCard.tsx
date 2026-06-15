import Link from "next/link";
import Flags from "@/components/Flags";
import ScoreBadge from "@/components/ScoreBadge";
import WatchlistStar from "@/components/WatchlistStar";
import { fmtMoney, fmtPct } from "@/lib/format";
import type { ScoredCompany } from "@/lib/types";

export default function CompanyCard({ c }: { c: ScoredCompany }) {
  return (
    <Link
      href={`/company/${c.entry.ticker}`}
      className="card group flex flex-col gap-3 p-4 transition hover:border-muted"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{c.entry.ticker}</span>
            <ScoreBadge score={c.score} size="sm" />
          </div>
          <p className="truncate text-sm text-muted">{c.entry.name}</p>
        </div>
        <WatchlistStar ticker={c.entry.ticker} />
      </div>

      <p className="line-clamp-2 text-xs text-slate-400">{c.entry.thesis}</p>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <Stat label="Growth" value={fmtPct(c.metrics.revenueGrowthYoY)} />
        <Stat label="Gross mgn" value={fmtPct(c.metrics.grossMargin)} />
        <Stat label="Mkt cap" value={fmtMoney(c.metrics.marketCap)} />
      </div>

      <Flags flags={c.flags.slice(0, 3)} />
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-panel2 px-2 py-1.5">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="tabular-nums">{value}</div>
    </div>
  );
}
