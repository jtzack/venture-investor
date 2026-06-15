"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ScoreBadge from "@/components/ScoreBadge";
import WatchlistStar from "@/components/WatchlistStar";
import { fmtMoney, fmtPct, scoreColor } from "@/lib/format";
import type { ScoredCompany, Theme } from "@/lib/types";

type SortKey = "score" | "growth" | "marketCap" | "margin";

const num = (v: number | null) => (v == null ? -Infinity : v);

export default function ScreenerTable({
  companies,
  allThemes,
  initialWatchOnly = false,
  watchlistFilter,
}: {
  companies: ScoredCompany[];
  allThemes: Theme[];
  initialWatchOnly?: boolean;
  /** When provided, only these tickers are shown (used by the watchlist page). */
  watchlistFilter?: string[];
}) {
  const [activeThemes, setActiveThemes] = useState<Set<Theme>>(new Set());
  const [q, setQ] = useState("");
  const [founderOnly, setFounderOnly] = useState(false);
  const [minGrowth, setMinGrowth] = useState(0); // percent
  const [sweetSpot, setSweetSpot] = useState(false);
  const [sort, setSort] = useState<SortKey>("score");

  const rows = useMemo(() => {
    let list = companies;

    if (watchlistFilter) {
      const set = new Set(watchlistFilter);
      list = list.filter((c) => set.has(c.entry.ticker));
    }
    if (activeThemes.size) {
      list = list.filter((c) =>
        c.entry.themes.some((t) => activeThemes.has(t)),
      );
    }
    if (founderOnly) list = list.filter((c) => c.entry.founderLed);
    if (minGrowth > 0) {
      list = list.filter(
        (c) =>
          c.metrics.revenueGrowthYoY != null &&
          c.metrics.revenueGrowthYoY * 100 >= minGrowth,
      );
    }
    if (sweetSpot) {
      list = list.filter(
        (c) =>
          c.metrics.marketCap != null &&
          c.metrics.marketCap >= 0.5e9 &&
          c.metrics.marketCap <= 5e9,
      );
    }
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.entry.ticker.toLowerCase().includes(s) ||
          c.entry.name.toLowerCase().includes(s),
      );
    }

    const sorted = [...list].sort((a, b) => {
      switch (sort) {
        case "growth":
          return num(b.metrics.revenueGrowthYoY) - num(a.metrics.revenueGrowthYoY);
        case "marketCap":
          return num(a.metrics.marketCap) - num(b.metrics.marketCap); // small first
        case "margin":
          return num(b.metrics.grossMargin) - num(a.metrics.grossMargin);
        default:
          return b.score - a.score;
      }
    });
    return sorted;
  }, [companies, watchlistFilter, activeThemes, founderOnly, minGrowth, sweetSpot, q, sort]);

  function toggleTheme(t: Theme) {
    setActiveThemes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  }

  return (
    <div>
      {/* Controls */}
      <div className="card mb-4 space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticker or name…"
            className="w-48 rounded-lg border border-edge bg-panel2 px-3 py-1.5 text-sm outline-none focus:border-muted"
          />
          <label className="btn cursor-pointer">
            <input
              type="checkbox"
              checked={founderOnly}
              onChange={(e) => setFounderOnly(e.target.checked)}
              className="accent-accent"
            />
            Founder-led only
          </label>
          <label className="btn cursor-pointer">
            <input
              type="checkbox"
              checked={sweetSpot}
              onChange={(e) => setSweetSpot(e.target.checked)}
              className="accent-accent"
            />
            $500M–$5B
          </label>
          <label className="btn cursor-pointer gap-2">
            Min growth
            <select
              value={minGrowth}
              onChange={(e) => setMinGrowth(Number(e.target.value))}
              className="bg-transparent text-sm outline-none"
            >
              {[0, 20, 30, 40, 50].map((v) => (
                <option key={v} value={v} className="bg-panel text-slate-200">
                  {v === 0 ? "any" : `${v}%+`}
                </option>
              ))}
            </select>
          </label>
          <label className="btn cursor-pointer gap-2">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="bg-transparent text-sm outline-none"
            >
              <option value="score" className="bg-panel">Score</option>
              <option value="growth" className="bg-panel">Revenue growth</option>
              <option value="margin" className="bg-panel">Gross margin</option>
              <option value="marketCap" className="bg-panel">Market cap (small→big)</option>
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {allThemes.map((t) => {
            const on = activeThemes.has(t);
            return (
              <button
                key={t}
                onClick={() => toggleTheme(t)}
                className={`chip transition ${
                  on
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-edge bg-panel2 text-muted hover:text-slate-200"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mb-2 px-1 text-xs text-muted">
        {rows.length} {rows.length === 1 ? "company" : "companies"}
      </p>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 border-b border-edge px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted md:grid">
          <span className="w-8" />
          <span>Company</span>
          <span className="text-right">Rev growth</span>
          <span className="text-right">Gross margin</span>
          <span className="text-right">Market cap</span>
          <span className="text-right">Score</span>
        </div>

        {rows.map((c) => (
          <Link
            key={c.entry.ticker}
            href={`/company/${c.entry.ticker}`}
            className="block border-b border-edge/60 px-4 py-3 transition last:border-0 hover:bg-panel2"
          >
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 md:grid-cols-[auto_1fr_auto_auto_auto_auto]">
              <div onClick={(e) => e.preventDefault()}>
                <WatchlistStar ticker={c.entry.ticker} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{c.entry.ticker}</span>
                  <span className="truncate text-sm text-muted">{c.entry.name}</span>
                  {c.dataIncomplete && (
                    <span className="chip border-edge bg-panel2 text-[10px] text-muted">
                      data pending
                    </span>
                  )}
                </div>
                <div className="mt-0.5 truncate text-xs text-muted">
                  {c.entry.themes.join(" · ")}
                  {c.entry.founderLed && c.entry.founder
                    ? ` · 👤 ${c.entry.founder}`
                    : ""}
                </div>
              </div>

              <div className="hidden text-right tabular-nums md:block">
                <span className={c.metrics.revenueGrowthYoY != null && c.metrics.revenueGrowthYoY >= 0.3 ? "text-accent" : ""}>
                  {fmtPct(c.metrics.revenueGrowthYoY)}
                </span>
              </div>
              <div className="hidden text-right tabular-nums md:block">
                {fmtPct(c.metrics.grossMargin)}
              </div>
              <div className="hidden text-right tabular-nums md:block">
                {fmtMoney(c.metrics.marketCap)}
              </div>

              <div className="flex items-center justify-end gap-2">
                <span className={`hidden text-sm font-semibold tabular-nums sm:inline ${scoreColor(c.score)}`}>
                  {c.score}
                </span>
                <ScoreBadge score={c.score} size="sm" />
              </div>
            </div>
          </Link>
        ))}

        {rows.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-muted">
            No companies match these filters.
          </div>
        )}
      </div>
    </div>
  );
}
