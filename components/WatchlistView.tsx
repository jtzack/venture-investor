"use client";

import Link from "next/link";
import ScreenerTable from "@/components/ScreenerTable";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { ScoredCompany, Theme } from "@/lib/types";

const REVIEW_STEPS = [
  "Open the latest earnings call transcript — is revenue growth accelerating or decelerating?",
  "Customer/units count: growing faster than last quarter?",
  "Any large new contracts, partnerships, or design wins mentioned?",
  "Are gross margins flat, expanding, or compressing?",
  "Is the cash runway improving (FCF trending toward positive)?",
  "Did management raise or cut guidance — and why?",
  "Check Reddit / G2 / Product Hunt: are users still obsessed?",
  "Has the original thesis strengthened, weakened, or broken?",
];

export default function WatchlistView({
  companies,
  allThemes,
}: {
  companies: ScoredCompany[];
  allThemes: Theme[];
}) {
  const { tickers, ready } = useWatchlist();

  if (!ready) {
    return <p className="text-sm text-muted">Loading your watchlist…</p>;
  }

  if (tickers.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-lg font-semibold">Your watchlist is empty</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          Aim for ~25 companies. Then spend 15 minutes each week reading one
          earnings report. After six months you&apos;ll know these businesses
          better than 95% of the people who own them.
        </p>
        <Link
          href="/screener"
          className="btn mt-4 border-accent/40 bg-accent/10 text-accent"
        >
          Browse the screener →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted">
          {tickers.length} of a target ~25 companies
        </span>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-edge">
          <div
            className="h-full bg-accent"
            style={{ width: `${Math.min((tickers.length / 25) * 100, 100)}%` }}
          />
        </div>
      </div>

      <ScreenerTable
        companies={companies}
        allThemes={allThemes}
        watchlistFilter={tickers}
      />

      <div className="card p-5">
        <h2 className="text-lg font-semibold">Weekly 15-minute review</h2>
        <p className="mt-1 text-sm text-muted">
          Run this checklist on one watchlist company per week. The goal is a
          living judgment of whether each thesis is getting stronger or weaker.
        </p>
        <ul className="mt-4 space-y-2">
          {REVIEW_STEPS.map((s, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1 accent-accent"
                // Intentionally uncontrolled: a scratchpad you reset each week.
              />
              <span className="text-slate-300">{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
